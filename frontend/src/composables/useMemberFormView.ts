import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '../api';
import { useToast } from './useToast';

export function useMemberFormView() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();
    const currentStep = ref(1);
    const isLoading = ref(false);
    const isEditMode = ref(false);
    const memberId = route.params.id;

    // UI State for Special Logic
    const religionSelect = ref('');
    const isRebaptism = ref(false);
    const selectedFile = ref<File | null>(null);
    const imagePreview = ref<string | null>(null);

    const form = ref({
        // --- STEP 1: PERSONAL INFO ---
        member_code: '',
        full_name: '',
        status: 'Active',
        gender: 'Male',
        civil_status: 'Single',
        birth_date: '',
        birthplace: '',
        mother_name: '',
        father_name: '',
        address_street: '',
        barangay: '',
        town_city: '',
        province: '',
        zip_code: '',
        phone_no: '',
        email: '',
        educational_level: 'College',
        occupation: '',
        former_religion: '',
        hobbies_gifts: '',
        profile_pic: '',

        // --- STEP 2: BAPTISMAL INFO ---
        baptism_date: '',
        officiating_minister: '',
        place_of_baptism: '',
        rebaptism_date: '',
        rebaptism_minister: '',
        rebaptism_place: '',

        // --- STEP 3: TRANSACTION & EXCLUSIONS ---
        received_by: '',
        date_received: '',
        from_church: '',
        from_church_group: '',
        date_received_letter: '',
        to_church_group: '',
        date_transferred_letter: '',
        observation: '',
        exclusion_type: '',
        exclusion_date: ''
    });

    // Separate Name Fields for Input
    const firstName = ref('');
    const lastName = ref('');
    const middleName = ref('');

    // 1. FETCH DATA IF EDITING
    onMounted(async () => {
        if (memberId) {
            isEditMode.value = true;
            isLoading.value = true;
            try {
                const response = await api(`/api/members/${memberId}`);
                if (!response.ok) throw new Error('Member not found');

                const data = await response.json();
                Object.assign(form.value, data);

                // PARSE FULL NAME (Format: Last, First Middle)
                if (data.full_name) {
                    if (data.full_name.includes(',')) {
                        const parts = data.full_name.split(',');
                        lastName.value = parts[0].trim();

                        const rest = parts[1].trim();
                        const nameParts = rest.split(' ');

                        firstName.value = rest;
                        if (nameParts.length > 1) {
                            middleName.value = nameParts.pop() || '';
                            firstName.value = nameParts.join(' ');
                        } else {
                            firstName.value = rest;
                            middleName.value = '';
                        }
                    } else {
                        lastName.value = data.full_name;
                    }
                }

                // Handle Re-baptism Toggle
                if (data.rebaptism_date && data.rebaptism_date !== '0000-00-00') {
                    isRebaptism.value = true;
                }

                // Handle Profile Picture Preview
                if (data.profile_pic) {
                    imagePreview.value = `http://localhost:8080/uploads/profile_pics/${data.profile_pic}`;
                }

                // Handle Religion Dropdown logic
                const standardReligions = ['Born Seventh-day Adventist', 'Roman Catholic', 'Iglesia ni Cristo', 'Born Again Christian', 'Baptist', 'Methodist', 'Anglican / Episcopal', 'Aglipayan', 'Jehovah\'s Witness', 'Mormon (LDS)', 'Islam', 'Buddhism', 'Indigenous Beliefs', 'None'];
                if (data.former_religion && !standardReligions.includes(data.former_religion)) {
                    religionSelect.value = 'Other';
                } else {
                    religionSelect.value = data.former_religion || '';
                }

            } catch (error) {
                console.error(error);
                toast.error('Error loading member data');
                router.push('/members');
            } finally {
                isLoading.value = false;
            }
        }
    });

    // Handling File Selection
    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            selectedFile.value = target.files[0];
            imagePreview.value = URL.createObjectURL(selectedFile.value);
        }
    };

    // WATCHERS
    watch(isRebaptism, (newVal) => {
        if (!newVal) {
            form.value.rebaptism_date = '';
            form.value.rebaptism_minister = '';
            form.value.rebaptism_place = '';
        }
    });

    watch(religionSelect, (newVal) => {
        if (newVal !== 'Other') {
            form.value.former_religion = newVal;
        }
    });

    // VALIDATION
    const validateStep1 = () => {
        if (!lastName.value || !firstName.value) {
            toast.warning("Last Name and First Name are required.");
            return false;
        }

        if (isEditMode.value) return true;

        if (!form.value.birth_date || !form.value.birthplace) {
            toast.warning("Please fill in all REQUIRED fields: Birthdate, Birthplace");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (currentStep.value === 1 && !validateStep1()) return;
        if (currentStep.value < 3) currentStep.value++;
    };

    const prevStep = () => {
        if (currentStep.value > 1) currentStep.value--;
    };

    // 2. SUBMIT FORM (FormData used for Image Support)
    const submitForm = async () => {
        isLoading.value = true;

        // CONSTRUCT FULL NAME before submit
        let constructedName = `${lastName.value}, ${firstName.value}`;
        if (middleName.value) {
            constructedName += ` ${middleName.value}`;
        }
        form.value.full_name = constructedName;

        const formData = new FormData();

        // Append all form text fields to FormData
        Object.keys(form.value).forEach(key => {
            formData.append(key, (form.value as any)[key] || '');
        });

        // Append the actual image file if one was selected
        if (selectedFile.value) {
            formData.append('profile_pic_file', selectedFile.value);
        }

        // Append current user info for change tracking
        const userData = localStorage.getItem('user');
        if (userData) {
            const currentUser = JSON.parse(userData);
            if (currentUser.name || currentUser.full_name) {
                formData.append('current_user_name', currentUser.name || currentUser.full_name);
            }
        }

        const url = isEditMode.value
            ? `/api/members/update/${memberId}`
            : '/api/members/create';

        try {
            const response = await api(url, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                toast.success(isEditMode.value ? 'Member updated successfully!' : 'Member added successfully!');
                router.push('/members');
            } else {
                const errorData = await response.json();

                if (errorData.messages) {
                    if (errorData.messages.full_name) {
                        toast.error(errorData.messages.full_name);
                    } else {
                        toast.error('Error saving: ' + JSON.stringify(errorData.messages));
                    }
                } else {
                    toast.error('Error saving: ' + (errorData.message || 'Check your data.'));
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Server connection failed.');
        } finally {
            isLoading.value = false;
        }
    };

    return {
        router,
        currentStep,
        isLoading,
        isEditMode,
        religionSelect,
        isRebaptism,
        selectedFile,
        imagePreview,
        form,
        firstName,
        lastName,
        middleName,
        handleFileChange,
        nextStep,
        prevStep,
        submitForm,
    };
}
