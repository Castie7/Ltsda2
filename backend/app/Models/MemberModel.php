<?php
namespace App\Models;
use CodeIgniter\Model;

class MemberModel extends Model {
    protected $table = 'members';
    protected $primaryKey = 'id';
    
    // BIG UPDATE HERE: Add 'barangay', 'town_city', 'province', 'zip_code'
    protected $allowedFields = [
        'member_code', 
        'status', 
        'full_name', 
        'gender', 
        'civil_status', 
        'birth_date', 
        'birthplace', 
        'mother_name', 
        'father_name', 
        'address_street', 
        'barangay',       // <--- WAS MISSING
        'town_city',      // <--- WAS MISSING
        'province',       // <--- WAS MISSING
        'zip_code',       // <--- WAS MISSING
        'phone_no', 
        'email', 
        'educational_level', 
        'occupation', 
        'former_religion', 
        'hobbies_gifts', 
        'baptism_date', 
        'officiating_minister', 
        'place_of_baptism',
        'rebaptism_date',         // Check if these are in your DB too
        'rebaptism_minister',
        'rebaptism_place',
        'profile_pic',            // Added
        'spouse_name',            // Added
        'conversion_method',      // Added
        'date_received_letter',   // Added
        'from_church_group',      // Added
        'date_transferred_letter',// Added
        'to_church_group',        // Added
        'received_by',            // Check if this matches your DB column
        'date_received', 
        'from_church', 
        'observation',
        'exclusion_type',
        'exclusion_type',
        'exclusion_date'
    ];

    protected $validationRules = [
        'full_name' => 'required|is_unique[members.full_name,id,{id}]',
        'birth_date' => 'required',
        'birthplace' => 'required',
    ];

    protected $validationMessages = [
        'full_name' => [
            'is_unique' => 'This member name is already registered in the system.'
        ]
    ];
}