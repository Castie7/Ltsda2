<script setup lang="ts">
import { useMovingReport } from '../composables/useMovingReport';
import { useToast } from '../composables/useToast';

const {
    isLoading,
    dateFrom,
    dateTo,
    filteredMembers,
    reportRows,
    clerkName,
    currentDate,
    showPreview,
    addToReport,
    addAllFiltered,
    removeFromReport,
    clearReport,
    togglePreview,
    printReport,
    resetAll,
} = useMovingReport();

const { error: toastError } = useToast();

const handlePreview = () => {
    if (reportRows.value.length === 0) {
        toastError('Please add at least one member to the report.');
        return;
    }
    togglePreview();
};
</script>

<template>
    <div class="max-w-5xl mx-auto p-6">
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
            <div>
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Member Moving Report</h1>
                <p class="text-slate-500 text-sm">Generate a report of transferred members</p>
            </div>
            <div v-if="showPreview" class="flex gap-3">
                <button @click="showPreview = false"
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    ← Back to Form
                </button>
                <button @click="printReport"
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all">
                    🖨️ Print Report
                </button>
            </div>
        </div>

        <!-- ═══════════ FORM MODE ═══════════ -->
        <div v-if="!showPreview" class="space-y-6">

            <!-- Date Filters -->
            <div class="moving-report-card !max-w-5xl">
                <div class="flex items-center gap-3 mb-6">
                    <span class="w-1.5 h-8 bg-orange-500 rounded-full"></span>
                    <h2 class="text-lg font-bold text-slate-800">Filter Transferred Members</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label for="dateFrom">From Date</label>
                        <input id="dateFrom" v-model="dateFrom" type="date" />
                    </div>
                    <div>
                        <label for="dateTo">To Date</label>
                        <input id="dateTo" v-model="dateTo" type="date" />
                    </div>
                </div>

                <!-- Available Members -->
                <div class="mb-4 flex items-center justify-between">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Available Transferred Members
                        <span class="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{{ filteredMembers.length }}</span>
                    </p>
                    <button
                        v-if="filteredMembers.length > 0"
                        @click="addAllFiltered"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                        + Add All
                    </button>
                </div>

                <div v-if="isLoading" class="text-center py-8 text-slate-400 text-sm">Loading members...</div>

                <div v-else-if="filteredMembers.length === 0" class="text-center py-8 text-slate-400 text-sm">
                    No transferred members found{{ dateFrom || dateTo ? ' in the selected date range' : '' }}.
                </div>

                <div v-else class="max-h-64 overflow-y-auto rounded-xl border border-slate-100">
                    <table class="available-table">
                        <thead class="sticky top-0 bg-white">
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Transferred To</th>
                                <th>Date</th>
                                <th class="w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="member in filteredMembers" :key="member.id">
                                <td class="font-mono text-xs">{{ member.member_code || 'N/A' }}</td>
                                <td class="font-semibold">{{ member.full_name }}</td>
                                <td>{{ member.to_church_group || 'N/A' }}</td>
                                <td class="text-xs text-slate-500">{{ member.date_transferred_letter || 'N/A' }}</td>
                                <td>
                                    <button
                                        @click="addToReport(member)"
                                        :disabled="reportRows.some(r => r.id === member.id)"
                                        class="px-2 py-1 rounded-lg text-xs font-bold transition-colors"
                                        :class="reportRows.some(r => r.id === member.id)
                                            ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'">
                                        {{ reportRows.some(r => r.id === member.id) ? '✓' : '+ Add' }}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Report Table (selected members) -->
            <div class="moving-report-card !max-w-5xl">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                        <h2 class="text-lg font-bold text-slate-800">Report Members</h2>
                        <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{{ reportRows.length }}</span>
                    </div>
                    <button v-if="reportRows.length > 0" @click="clearReport"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                        Clear All
                    </button>
                </div>

                <div v-if="reportRows.length === 0" class="text-center py-8 text-slate-400 text-sm">
                    No members added to the report yet. Use the table above to add members.
                </div>

                <table v-else class="report-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Transferred To</th>
                            <th class="w-16"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in reportRows" :key="row.id">
                            <td class="font-mono text-xs">{{ row.code }}</td>
                            <td class="font-semibold">{{ row.name }}</td>
                            <td>{{ row.transferredTo }}</td>
                            <td>
                                <button @click="removeFromReport(row.id)"
                                    class="px-2 py-1 rounded-lg text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                                    ✕
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Auto-filled -->
                <div class="bg-slate-50 rounded-xl p-5 border border-slate-100 mt-6">
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

                <!-- Actions -->
                <div class="mt-6 flex flex-wrap gap-3">
                    <button @click="handlePreview"
                        class="px-6 py-3 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/25 transition-all">
                        Preview Report
                    </button>
                    <button @click="resetAll"
                        class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                        Reset
                    </button>
                </div>
            </div>
        </div>

        <!-- ═══════════ PRINT PREVIEW ═══════════ -->
        <div v-else class="letter-preview-wrapper moving-report-print-area">
            <div class="moving-report-page">

                <!-- Header -->
                <div class="letter-header">
                    <img src="/sda.png" alt="SDA Logo" />
                    <h1>Mountain Provinces Mission of the Seventh-Day Adventist</h1>
                    <h2>La Trinidad Seventh-Day Adventist Church</h2>
                </div>

                <!-- Title -->
                <h3 style="text-align: center; font-size: 1.15rem; font-weight: bold; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Member Moving Report
                </h3>

                <!-- Body -->
                <p style="font-size: 1rem; line-height: 1.8; margin-bottom: 1.5rem;">
                    The Church of <strong>La Trinidad Seventh-Day Adventist</strong> reports the move of the following persons:
                </p>

                <!-- Table -->
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Transferred To</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in reportRows" :key="row.id">
                            <td>{{ row.code }}</td>
                            <td>{{ row.name }}</td>
                            <td>{{ row.transferredTo }}</td>
                        </tr>
                    </tbody>
                </table>

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

<style src="../styles/MovingReportView.css"></style>
