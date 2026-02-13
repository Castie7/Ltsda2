<script setup lang="ts">
import { useAdmissionCertificate } from '../composables/useAdmissionCertificate';
import { useToast } from '../composables/useToast';

const {
    fromChurch,
    forChurch,
    lastName,
    firstName,
    middleInitial,
    meetingDate,
    minuteNumber,
    clerkName,
    currentDate,
    fullName,
    showPreview,
    formatDate,
    isFormValid,
    togglePreview,
    printLetter,
    resetForm,
} = useAdmissionCertificate();

const { error: toastError } = useToast();

const handlePreview = () => {
    if (!isFormValid()) {
        toastError('Please fill in all required fields (churches and member name).');
        return;
    }
    togglePreview();
};
</script>

<template>
    <div class="max-w-4xl mx-auto p-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
            <div>
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Member Admission Certificate</h1>
                <p class="text-slate-500 text-sm">Generate a certificate for a newly admitted member</p>
            </div>
            <div v-if="showPreview" class="flex gap-3">
                <button @click="showPreview = false"
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    ← Back to Form
                </button>
                <button @click="printLetter"
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all">
                    🖨️ Print Certificate
                </button>
            </div>
        </div>

        <!-- ═══════════ FORM MODE ═══════════ -->
        <div v-if="!showPreview" class="admission-form-card">
            <div class="flex items-center gap-3 mb-8">
                <span class="w-1.5 h-8 bg-violet-600 rounded-full"></span>
                <h2 class="text-lg font-bold text-slate-800">Certificate Details</h2>
            </div>

            <div class="space-y-6">
                <!-- From / For Churches -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="fromChurch">From the Church of</label>
                        <input id="fromChurch" v-model="fromChurch" type="text" placeholder="e.g. Baguio City" />
                        <p class="text-xs text-slate-400 mt-1">"Seventh-Day Adventist Church" added automatically</p>
                    </div>
                    <div>
                        <label for="forChurch">For the Church of</label>
                        <input id="forChurch" v-model="forChurch" type="text" placeholder="e.g. La Trinidad" />
                        <p class="text-xs text-slate-400 mt-1">"Seventh-Day Adventist Church" added automatically</p>
                    </div>
                </div>

                <!-- Member Name (separate fields) -->
                <div>
                    <p class="text-sm font-semibold text-slate-700 mb-3">Member Name</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label for="lastName" class="!text-xs !text-slate-400">Last Name</label>
                            <input id="lastName" v-model="lastName" type="text" placeholder="Dela Cruz" />
                        </div>
                        <div>
                            <label for="firstName" class="!text-xs !text-slate-400">First Name</label>
                            <input id="firstName" v-model="firstName" type="text" placeholder="Juan" />
                        </div>
                        <div>
                            <label for="middleInitial" class="!text-xs !text-slate-400">Middle Initial</label>
                            <input id="middleInitial" v-model="middleInitial" type="text" placeholder="P" maxlength="2" />
                        </div>
                    </div>
                    <p v-if="fullName" class="text-xs text-slate-500 mt-2">
                        Preview: <span class="font-semibold text-slate-700">{{ fullName }}</span>
                    </p>
                </div>

                <!-- Meeting Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="meetingDate">Date of Church Meeting</label>
                        <input id="meetingDate" v-model="meetingDate" type="date" />
                    </div>
                    <div>
                        <label for="minuteNumber">Minute #</label>
                        <input id="minuteNumber" v-model="minuteNumber" type="text" placeholder="e.g. 2026-001" />
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
                <button @click="handlePreview"
                    class="px-6 py-3 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25 transition-all">
                    Preview Certificate
                </button>
                <button @click="resetForm"
                    class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    Reset
                </button>
            </div>
        </div>

        <!-- ═══════════ PRINT PREVIEW MODE ═══════════ -->
        <div v-else class="letter-preview-wrapper admission-print-area">
            <div class="admission-letter-page">

                <!-- Header -->
                <div class="letter-header">
                    <img src="/sda.png" alt="SDA Logo" />
                    <h1>Mountain Provinces Mission of the Seventh-Day Adventist</h1>
                    <h2>La Trinidad Seventh-Day Adventist Church</h2>
                </div>

                <!-- Title -->
                <h3 style="text-align: center; font-size: 1.15rem; font-weight: bold; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Member Admission Certificate
                </h3>

                <!-- Body -->
                <div class="letter-body">
                    <p>
                        From the church of
                        <span class="field-value">{{ fromChurch }} Seventh-Day Adventist Church</span>
                        for the Church of
                        <span class="field-value">{{ forChurch }} Seventh-Day Adventist Church</span>.
                    </p>
                    <p style="margin-top: 1rem;">
                        We report that
                        <span class="field-value">{{ fullName }}</span>,
                        recommended by your church, was accepted as member of the church.
                    </p>
                </div>

                <!-- Meeting Info -->
                <div style="display: flex; justify-content: space-between; margin: 1.5rem 0; font-size: 0.95rem;">
                    <p><strong>Date of Church Meeting:</strong> {{ meetingDate ? formatDate(meetingDate) : '_______________' }}</p>
                    <p><strong>Minute #:</strong> {{ minuteNumber || '_______________' }}</p>
                </div>

                <!-- Signature -->
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

<style src="../styles/AdmissionCertificateView.css"></style>
