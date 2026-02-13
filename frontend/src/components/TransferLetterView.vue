<script setup lang="ts">
import { useTransferLetter } from '../composables/useTransferLetter';
import { useToast } from '../composables/useToast';

const {
    churchName,
    cityProvince,
    localMissionConference,
    memberName,
    clerkName,
    currentDate,
    showPreview,
    isFormValid,
    togglePreview,
    printLetter,
    resetForm,
} = useTransferLetter();

const { error: toastError } = useToast();

const handlePreview = () => {
    if (!isFormValid()) {
        toastError('Please fill in all fields before previewing.');
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
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Transfer Letter Request</h1>
                <p class="text-slate-500 text-sm">Generate a formal church membership transfer request letter</p>
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
                <span class="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                <h2 class="text-lg font-bold text-slate-800">Letter Details</h2>
            </div>

            <div class="space-y-6">
                <div>
                    <label for="memberName">Name of the Member</label>
                    <input id="memberName" v-model="memberName" type="text"
                        placeholder="e.g. Juan Dela Cruz" />
                </div>

                <div>
                    <label for="churchName">Requesting from Church of</label>
                    <input id="churchName" v-model="churchName" type="text"
                        placeholder="e.g. Baguio City" />
                    <p class="text-xs text-slate-400 mt-1">"Seventh-Day Adventist Church" will be added automatically</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="cityProvince">City/Town, State/Province</label>
                        <input id="cityProvince" v-model="cityProvince" type="text"
                            placeholder="e.g. Baguio City, Benguet" />
                    </div>
                    <div>
                        <label for="localMissionConference">Local Mission/Conference</label>
                        <select id="localMissionConference" v-model="localMissionConference"
                            class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all">
                            <option value="" disabled>Select a Mission/Conference</option>
                            <optgroup label="Northern Luzon Philippine Union Mission (NLPUM)">
                                <option value="Mountain Provinces Mission (Baguio City)">Mountain Provinces Mission (Baguio City)</option>
                                <option value="Northeast Luzon Mission (Alicia, Isabela)">Northeast Luzon Mission (Alicia, Isabela)</option>
                                <option value="Northern Luzon Mission (Artacho, Sison, Pangasinan)">Northern Luzon Mission (Artacho, Sison, Pangasinan)</option>
                                <option value="Central Luzon Conference (Quezon City)">Central Luzon Conference (Quezon City)</option>
                            </optgroup>
                            <optgroup label="Southern Luzon Philippine Union Mission (SLPUM)">
                                <option value="Cavite Mission (Silang, Cavite)">Cavite Mission (Silang, Cavite)</option>
                                <option value="Mindoro Island Mission (Calapan City, Oriental Mindoro)">Mindoro Island Mission (Calapan City, Oriental Mindoro)</option>
                                <option value="Palawan Mission (Puerto Princesa City)">Palawan Mission (Puerto Princesa City)</option>
                                <option value="Southern Luzon Mission (Legazpi City, Albay)">Southern Luzon Mission (Legazpi City, Albay)</option>
                                <option value="South Central Luzon Conference (Lucena City)">South Central Luzon Conference (Lucena City)</option>
                            </optgroup>
                            <optgroup label="East Central Philippine Union Conference (ECPUC)">
                                <option value="Central Visayan Conference (Cebu City)">Central Visayan Conference (Cebu City)</option>
                                <option value="East Visayan Conference (Tacloban City)">East Visayan Conference (Tacloban City)</option>
                                <option value="Negros Oriental-Siquijor Mission (Sibulan, Negros Oriental)">Negros Oriental-Siquijor Mission (Sibulan, Negros Oriental)</option>
                                <option value="Samar Mission (Catbalogan City)">Samar Mission (Catbalogan City)</option>
                            </optgroup>
                            <optgroup label="West Central Philippine Union Mission (WCPUM)">
                                <option value="Negros Occidental Conference (Bacolod City)">Negros Occidental Conference (Bacolod City)</option>
                                <option value="West Visayan Conference (Iloilo City)">West Visayan Conference (Iloilo City)</option>
                            </optgroup>
                            <optgroup label="Southwestern Philippine Union Conference (SwPUC)">
                                <option value="Central Mindanao Mission (Valencia City, Bukidnon)">Central Mindanao Mission (Valencia City, Bukidnon)</option>
                                <option value="Zamboanga Peninsula Mission (Pangi, Ipil, Zamboanga Sibugay)">Zamboanga Peninsula Mission (Pangi, Ipil, Zamboanga Sibugay)</option>
                                <option value="North Central Mindanao Conference (Cagayan de Oro City)">North Central Mindanao Conference (Cagayan de Oro City)</option>
                                <option value="Western Mindanao Conference (Ozamiz City)">Western Mindanao Conference (Ozamiz City)</option>
                            </optgroup>
                            <optgroup label="Southeastern Philippine Union Mission (SePUM)">
                                <option value="Davao Mission (Davao City)">Davao Mission (Davao City)</option>
                                <option value="Northern Caraga Mission (Butuan City)">Northern Caraga Mission (Butuan City)</option>
                                <option value="Northeastern Mindanao Mission (Surigao City)">Northeastern Mindanao Mission (Surigao City)</option>
                                <option value="Southeastern Caraga Mission (Bislig City)">Southeastern Caraga Mission (Bislig City)</option>
                            </optgroup>
                        </select>
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

            <div class="mt-8 flex gap-3">
                <button @click="handlePreview"
                    class="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all">
                    Preview & Print
                </button>
                <button @click="resetForm"
                    class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    Reset
                </button>
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
                <h3 style="text-align: center; font-size: 1.15rem; font-weight: bold; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Transfer Letter Request</h3>

                <!-- Letter Body -->
                <div class="letter-body">
                    <p>
                        The Church of <strong>La Trinidad Seventh-Day Adventist Church</strong>
                        requests from the church of
                        <span class="field-value">{{ churchName }} Seventh-Day Adventist Church</span>
                        in
                        <span class="field-value">{{ cityProvince }}</span>,
                        <span class="field-value">{{ localMissionConference }}</span>
                        the letter of transfer of
                        <span class="field-value">{{ memberName }}</span>.
                    </p>
                </div>

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

<style src="../styles/TransferLetterView.css"></style>
