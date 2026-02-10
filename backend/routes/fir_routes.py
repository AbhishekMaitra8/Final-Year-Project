
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db import get_db
from datetime import datetime
from deep_translator import GoogleTranslator
import uuid
from bson import ObjectId

fir_bp = Blueprint('fir', __name__)

@fir_bp.route('/', methods=['POST'])
@jwt_required()
def submit_fir():
    user_id = get_jwt_identity()
    data = request.json
    
    original_text = data.get('text')
    language = data.get('language', 'en')
    
    # New Fields
    incident_date = data.get('incident_date')
    incident_time = data.get('incident_time')
    incident_date = data.get('incident_date')
    incident_time = data.get('incident_time')
    location = data.get('location')
    station_id = data.get('station_id')
    
    if not original_text:
        return jsonify({'error': 'FIR description is required'}), 400
        
    # Translation
    translated_text = original_text
    if language != 'en':
        try:
            # Note: GoogleTranslator might block if used too heavily.
            translated_text = GoogleTranslator(source='auto', target='en').translate(original_text)
        except Exception as e:
            print(f"Translation failed: {e}")
            pass
            
    # Save to DB
    fir_entry = {
        '_id': str(uuid.uuid4()),
        'user_id': user_id,
        'original_text': original_text,
        'translated_text': translated_text,
        'language': language,
        'incident_date': incident_date,
        'incident_time': incident_time,
        'incident_time': incident_time,
        'location': location,
        'station_id': station_id,
        'status': 'pending',
        'submission_date': datetime.utcnow()
    }
    
    db = get_db()
    if db is None:
        return jsonify({'error': 'Database error'}), 500

    # Fetch user details to embed in FIR
    # This ensures the FIR is self-contained and identifiable for the police
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        # Fallback or error, but user_id came from JWT so should exist.
        # Could be a police user filing? Assuming citizen for now.
        pass

    fir_entry = {
        '_id': str(uuid.uuid4()),
        'user_id': user_id,
        'complainant_name': user.get('full_name', 'Unknown') if user else 'Unknown',
        'complainant_phone': user.get('phone', 'N/A') if user else 'N/A',
        'complainant_aadhar': user.get('aadhar', 'N/A') if user else 'N/A',
        'original_text': original_text,
        'translated_text': translated_text,
        'language': language,
        'incident_date': incident_date,
        'incident_time': incident_time,
        'location': location,
        'station_id': station_id,
        'status': 'pending',
        'submission_date': datetime.utcnow()
    }
    
    db.firs.insert_one(fir_entry)
    return jsonify({'message': 'FIR submitted successfully', 'fir_id': fir_entry['_id']}), 201

@fir_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_firs():
    user_id = get_jwt_identity()
    db = get_db()
    if db is not None:
        # Fetch from active firs
        active_firs = list(db.firs.find({'user_id': user_id}))
        # Fetch from archives
        archived_firs = list(db.archives.find({'user_id': user_id}))
        
        all_firs = active_firs + archived_firs
        
        for fir in all_firs:
            fir['_id'] = str(fir['_id'])
            if 'submission_date' in fir:
                 fir['submission_date'] = fir['submission_date'].isoformat()
            if 'last_updated' in fir and isinstance(fir['last_updated'], datetime):
                 fir['last_updated'] = fir['last_updated'].isoformat()
                 
        # Sort by submission date desc
        all_firs.sort(key=lambda x: x.get('submission_date', ''), reverse=True)
                 
        return jsonify(all_firs), 200
    return jsonify([]), 200

@fir_bp.route('/archives', methods=['GET'])
@jwt_required()
def get_archived_firs():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role', 'citizen')
    
    db = get_db()
    if db is not None:
        query = {}
        # If citizen, only show their own archives
        if role == 'citizen':
            query['user_id'] = user_id
        # If police, show all archives (or filter by station if implemented)
        
        archives = list(db.archives.find(query).sort('submission_date', -1))
        
        for fir in archives:
            fir['_id'] = str(fir['_id'])
            if 'submission_date' in fir and isinstance(fir['submission_date'], datetime):
                 fir['submission_date'] = fir['submission_date'].isoformat()
            if 'last_updated' in fir and isinstance(fir['last_updated'], datetime):
                 fir['last_updated'] = fir['last_updated'].isoformat()
                 
        return jsonify(archives), 200
    return jsonify([]), 500

# Police Endpoints

@fir_bp.route('/pending', methods=['GET'])
@jwt_required()
def get_pending_firs():
    claims = get_jwt()
    # Check if user is police
    if claims.get('role') != 'police':
        return jsonify({'error': 'Unauthorized'}), 403
        
    station_id = claims.get('station_id')
    # If a station_id is assigned, filter by it. If not, maybe show all (or none). 
    # For now, let's assume filtering if present.
    
    query = {'status': {'$in': ['pending', 'in_progress']}}
    if station_id:
        query['station_id'] = station_id
        
    db = get_db()
    if db is not None:
        # Fetch pending or in-progress
        firs = list(db.firs.find(query))
        for fir in firs:
            fir['_id'] = str(fir['_id'])
            if 'submission_date' in fir:
                 fir['submission_date'] = fir['submission_date'].isoformat()
        return jsonify(firs), 200
    return jsonify([]), 500

@fir_bp.route('/<fir_id>/update', methods=['PUT'])
@jwt_required()
def update_fir(fir_id):
    # Verify police role here ideally
    data = request.json
    status = data.get('status')
    sections = data.get('applicable_sections', []) # List of strings
    police_notes = data.get('police_notes', '')
    
    if not status:
        return jsonify({'error': 'Status is required'}), 400
        
    db = get_db()
    if db is not None:
        old_fir = db.firs.find_one({'_id': fir_id})
        
        if not old_fir:
             return jsonify({'error': 'FIR not found'}), 404
             
        old_status = old_fir.get('status')
        
        update_data = {
            'status': status,
            'police_notes': police_notes,
            'last_updated': datetime.utcnow()
        }
        
        if sections:
            update_data['applicable_sections'] = sections
            
        if status == 'resolved':
            # Move to archives
            archived_fir = old_fir.copy()
            archived_fir.update(update_data)
            
            # Insert into archives
            db.archives.insert_one(archived_fir)
            
            # Remove from firs
            db.firs.delete_one({'_id': fir_id})
            
            # Notify user
            msg = f"Your FIR ({fir_id[:8]}) has been marked as RESOLVED."
            notification = {
                '_id': str(uuid.uuid4()),
                'user_id': old_fir['user_id'],
                'message': msg,
                'is_read': False,
                'created_at': datetime.utcnow()
            }
            db.notifications.insert_one(notification)
            
            return jsonify({'message': 'FIR completed and archived'}), 200
            
        else:
            # Normal update
            result = db.firs.update_one({'_id': fir_id}, {'$set': update_data})
            
            if result.matched_count:
                # Create Notification if status changed
                if old_status != status:
                    msg = f"Your FIR ({fir_id[:8]}) status has been updated to '{status.replace('_', ' ').title()}'."
                    notification = {
                        '_id': str(uuid.uuid4()),
                        'user_id': old_fir['user_id'],
                        'message': msg,
                        'is_read': False,
                        'created_at': datetime.utcnow()
                    }
                    db.notifications.insert_one(notification)
                    
                return jsonify({'message': 'FIR updated successfully'}), 200
            else:
                return jsonify({'error': 'FIR not found'}), 404
    return jsonify({'error': 'Database error'}), 500

@fir_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    db = get_db()
    if db is not None:
        notifs = list(db.notifications.find({'user_id': user_id}).sort('created_at', -1))
        for n in notifs:
            n['_id'] = str(n['_id'])
            if 'created_at' in n:
                n['created_at'] = n['created_at'].isoformat()
        return jsonify(notifs), 200
    return jsonify([]), 500

@fir_bp.route('/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()
    db = get_db()
    if db is not None:
        db.notifications.update_one(
            {'_id': notification_id, 'user_id': user_id},
            {'$set': {'is_read': True}}
        )
        return jsonify({'message': 'Marked as read'}), 200
    return jsonify({'error': 'Database error'}), 500
