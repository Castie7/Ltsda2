import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

export function useImportCsv() {
    const router = useRouter();
    const fileInput = ref<HTMLInputElement | null>(null);
    const selectedFile = ref<File | null>(null);
    const isUploading = ref(false);
    const uploadStatus = ref<{ type: 'success' | 'error', message: string } | null>(null);

    const downloadTemplate = () => {
        const headers = [
            'first_name', 'middle_name', 'last_name',
            'member_code', 'status', 'gender', 'civil_status',
            'birth_date', 'birthplace',
            'address_street', 'barangay', 'town_city', 'province', 'zip_code',
            'phone_no', 'email',
            'educational_level', 'occupation',
            'hear_about_us',
            'former_religion', 'hobbies_gifts',
            'baptism_date', 'officiating_minister', 'place_of_baptism',
            'rebaptism_date', 'rebaptism_minister', 'rebaptism_place',
            'received_by', 'date_received', 'from_church',
            'observation'
        ];

        const exampleRow = [
            'John', 'A.', 'Doe',
            'MEM001', 'Active', 'Male', 'Single',
            '1990-01-01', 'Manila',
            '123 Sun St.', 'San Jose', 'La Trinidad', 'Benguet', '2601',
            '09123456789', 'john.doe@example.com',
            'College', 'Engineer',
            '',
            'Roman Catholic', 'Singing',
            '2010-05-15', 'Ptr. Smith', 'LTSDA Church',
            '', '', '',
            'Profession of Faith', '2010-05-15', '',
            'No specific observations'
        ];

        const csvContent = headers.join(',') + '\n' + exampleRow.join(',');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'LTSDA_Member_Template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            selectedFile.value = target.files[0] || null;
            uploadStatus.value = null; // Clear previous status
        }
    };

    const uploadFile = async () => {
        if (!selectedFile.value) return;

        isUploading.value = true;
        uploadStatus.value = null;

        const formData = new FormData();
        formData.append('csv_file', selectedFile.value);

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.id) formData.append('current_user_id', user.id);
            // Auth.php returns 'name', not 'full_name'. key is user.name
            const userName = user.name || user.full_name;
            if (userName) formData.append('current_user_name', userName);

            const response = await api('/api/members/import', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                uploadStatus.value = { type: 'success', message: 'Members imported successfully!' };
                selectedFile.value = null;
                if (fileInput.value) fileInput.value.value = '';
                setTimeout(() => router.push('/members'), 1500);
            } else {
                const errorText = await response.text();
                uploadStatus.value = { type: 'error', message: `Upload failed: ${errorText || response.statusText}` };
            }
        } catch (error) {
            uploadStatus.value = { type: 'error', message: 'Network error occurred during upload.' };
            console.error(error);
        } finally {
            isUploading.value = false;
        }
    };

    return {
        router,
        fileInput,
        selectedFile,
        isUploading,
        uploadStatus,
        downloadTemplate,
        handleFileChange,
        uploadFile,
    };
}
