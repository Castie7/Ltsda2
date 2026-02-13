<script setup lang="ts">
import { useTransferForm } from '../composables/useTransferForm';
import { useToast } from '../composables/useToast';

const {
    fromChurch,
    forChurch,
    meetingDate,
    minuteNumber,
    searchQuery,
    showDropdown,
    searchResults,
    selectedMember,
    statusUpdated,
    clerkName,
    currentDate,
    genderPronoun,
    showPreview,
    selectMember,
    clearMember,
    formatDate,
    isFormValid,
    togglePreview,
    updateMemberStatus,
    printLetter,
    resetForm,
} = useTransferForm();

const { error: toastError } = useToast();

const hideDropdown = () => {
    setTimeout(() => { showDropdown.value = false; }, 200);
};

const handlePreview = () => {
    if (!isFormValid()) {
        toastError('Please fill in all required fields and select a member.');
        return;
    }
    togglePreview();
};

const handleGenerateAndTransfer = async () => {
    if (!isFormValid()) {
        toastError('Please fill in all required fields and select a member.');
        return;
    }
    await updateMemberStatus();
    togglePreview();
};
</script>

<template>
    <div class="max-w-4xl mx-auto p-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
            <div>
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Letter of Transfer Form</h1>
                <p class="text-slate-500 text-sm">Generate a formal membership transfer letter with member details</p>
            </div>
            <div v-if="showPreview" class="flex gap-3">
                <button @click="showPreview = false"
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    ← Back to Form
                </button>
                <button @click="printLetter"
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all">
                    🖨️ Print Letter
                </button>
            </div>
        </div>

        <!-- ═══════════ FORM MODE ═══════════ -->
        <div v-if="!showPreview" class="transfer-form-card">
            <div class="flex items-center gap-3 mb-8">
                <span class="w-1.5 h-8 bg-emerald-600 rounded-full"></span>
                <h2 class="text-lg font-bold text-slate-800">Transfer Details</h2>
            </div>

            <div class="space-y-6">
                <!-- From / For Churches -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="fromChurch">From the Church of</label>
                        <input id="fromChurch" v-model="fromChurch" type="text"
                            placeholder="e.g. La Trinidad" />
                        <p class="text-xs text-slate-400 mt-1">"Seventh-Day Adventist Church" added automatically</p>
                    </div>
                    <div>
                        <label for="forChurch">For the Church of</label>
                        <input id="forChurch" v-model="forChurch" type="text"
                            placeholder="e.g. Baguio City" />
                        <p class="text-xs text-slate-400 mt-1">"Seventh-Day Adventist Church" added automatically</p>
                    </div>
                </div>

                <!-- Member Search -->
                <div>
                    <label>Search Member</label>
                    <div class="member-search-wrapper">
                        <div v-if="selectedMember" class="selected-member-badge">
                            <span class="font-semibold">{{ selectedMember.full_name }}</span>
                            <span class="text-blue-500 text-xs">({{ selectedMember.status }})</span>
                            <button @click="clearMember" class="ml-auto text-blue-400 hover:text-red-500 transition-colors text-lg">&times;</button>
                        </div>
                        <div v-else>
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Type member name to search..."
                                @focus="showDropdown = true"
                                @blur="hideDropdown"
                            />
                            <ul v-if="showDropdown && searchResults.length > 0" class="member-search-dropdown">
                                <li v-for="member in searchResults" :key="member.id" @mousedown.prevent="selectMember(member)">
                                    <span class="font-semibold">{{ member.full_name }}</span>
                                    <span class="text-slate-400 text-xs ml-2">{{ member.gender }} · {{ member.status }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Member Info (auto-filled) -->
                <div v-if="selectedMember" class="member-info-grid">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 col-span-full">Auto-filled Member Information</p>
                    <div class="info-item">
                        <span class="info-label">Date of Birth</span>
                        <p class="info-value">{{ formatDate(selectedMember.birth_date) }}</p>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Place of Birth</span>
                        <p class="info-value">{{ selectedMember.birthplace || 'N/A' }}</p>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Name of Father</span>
                        <p class="info-value">{{ selectedMember.father_name || 'N/A' }}</p>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Name of Mother</span>
                        <p class="info-value">{{ selectedMember.mother_name || 'N/A' }}</p>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date of Baptism</span>
                        <p class="info-value">{{ formatDate(selectedMember.baptism_date) }}</p>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Place of Baptism</span>
                        <p class="info-value">{{ selectedMember.place_of_baptism || 'N/A' }}</p>
                    </div>
                    <div class="info-item col-span-full">
                        <span class="info-label">Officiating Minister</span>
                        <p class="info-value">{{ selectedMember.officiating_minister || 'N/A' }}</p>
                    </div>
                </div>

                <!-- Meeting Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="meetingDate">Date of Church Meeting</label>
                        <input id="meetingDate" v-model="meetingDate" type="date" />
                    </div>
                    <div>
                        <label for="minuteNumber">Minute #</label>
                        <input id="minuteNumber" v-model="minuteNumber" type="text"
                            placeholder="e.g. 2026-001" />
                    </div>
                </div>

                <!-- Auto-filled info -->
                <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Auto-filled Information</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-slate-400">Clerk Name:</span>
                            <span class="ml-2 font-semibold text-slate-700">{{ clerkName }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Date:</span>
                            <span class="ml-2 font-semibold text-slate-700">{{ currentDate }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex flex-wrap gap-3">
                <button @click="handleGenerateAndTransfer"
                    class="px-6 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 transition-all">
                    Generate & Mark as Transferred
                </button>
                <button @click="handlePreview"
                    class="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all">
                    Preview Only
                </button>
                <button @click="resetForm"
                    class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    Reset
                </button>
            </div>

            <!-- Status Updated Badge -->
            <div v-if="statusUpdated" class="mt-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                ✅ Member status has been updated to <strong>Transferred</strong>
            </div>
        </div>

        <!-- ═══════════ PRINT PREVIEW MODE ═══════════ -->
        <div v-else class="letter-preview-wrapper letter-print-area">
            <div class="letter-page">

                <!-- Letter Header -->
                <div class="letter-header">
                    <img src="/sda.png" alt="SDA Logo" />
                    <h1>Mountain Provinces Mission of the Seventh-Day Adventist</h1>
                    <h2>La Trinidad Seventh-Day Adventist Church</h2>
                </div>

                <!-- Letter Title -->
                <h3 style="text-align: center; font-size: 1.15rem; font-weight: bold; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Letter of Transfer
                </h3>

                <!-- Letter Body -->
                <div class="letter-body">
                    <p>
                        From the church of
                        <span class="field-value">{{ fromChurch }} Seventh-Day Adventist Church</span>
                        for the Church of
                        <span class="field-value">{{ forChurch }} Seventh-Day Adventist Church</span>.
                    </p>
                    <p style="margin-top: 1rem;">
                        We report that
                        <span class="field-value">{{ selectedMember?.full_name }}</span>
                        is a regular member of our church. We recommend
                        <span class="field-value">{{ genderPronoun }}</span> to your care.
                    </p>
                </div>

                <!-- Meeting Info Row -->
                <div style="display: flex; justify-content: space-between; margin: 1.5rem 0; font-size: 0.95rem;">
                    <p><strong>Date of Church Meeting:</strong> {{ meetingDate ? formatDate(meetingDate) : '_______________' }}</p>
                    <p><strong>Minute #:</strong> {{ minuteNumber || '_______________' }}</p>
                </div>

                <!-- Member Information Table -->
                <table class="letter-info-table">
                    <tr>
                        <td class="label-cell">Date of Birth:</td>
                        <td>{{ selectedMember ? formatDate(selectedMember.birth_date) : 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Place of Birth:</td>
                        <td>{{ selectedMember?.birthplace || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Name of Father:</td>
                        <td>{{ selectedMember?.father_name || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Name of Mother:</td>
                        <td>{{ selectedMember?.mother_name || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Date of Baptism:</td>
                        <td>{{ selectedMember ? formatDate(selectedMember.baptism_date) : 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Place of Baptism:</td>
                        <td>{{ selectedMember?.place_of_baptism || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="label-cell">Officiating Minister:</td>
                        <td>{{ selectedMember?.officiating_minister || 'N/A' }}</td>
                    </tr>
                </table>

                <!-- Signature Section -->
                <div class="letter-signature">
                    <div class="signature-line">
                        <p class="font-semibold text-slate-900">{{ clerkName }}</p>
                        <p class="text-xs text-slate-600">Church Clerk</p>
                    </div>
                </div>

                <!-- Date -->
                <div class="letter-date">
                    <p><strong>Date:</strong> {{ currentDate }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="../styles/TransferFormView.css"></style>
