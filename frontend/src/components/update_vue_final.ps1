
$enc = [System.Text.Encoding]::UTF8

# 1. ImportCsv.vue
$file1 = 'c:\xampp\htdocs\LTSDA2\frontend\src\components\ImportCsv.vue'
$lines1 = Get-Content $file1 -Encoding UTF8
# Template starts at line 109 (index 108)
$template1 = $lines1[108..($lines1.Count - 1)]
$header1 = @"
<script setup lang="ts">
import { useImportCsv } from '../composables/useImportCsv';

const {
  router,
  fileInput,
  selectedFile,
  isUploading,
  uploadStatus,
  downloadTemplate,
  handleFileChange,
  uploadFile,
} = useImportCsv();
</script>
"@
[System.IO.File]::WriteAllText($file1, $header1 + "`n" + ($template1 -join "`n"), $enc)
Write-Host "ImportCsv.vue updated"

# 2. MemberExportView.vue
$file2 = 'c:\xampp\htdocs\LTSDA2\frontend\src\components\MemberExportView.vue'
$lines2 = Get-Content $file2 -Encoding UTF8
# Template starts at line 172 (index 171). Stop before 400 (index 399). Last index 398.
$template2 = $lines2[171..398]
$header2 = @"
<script setup lang="ts">
import { useMemberExportView } from '../composables/useMemberExportView';

const {
  router,
  members,
  selectedMembers,
  isLoading,
  isPrinting,
  searchQuery,
  statusFilter,
  genderFilter,
  civilStatusFilter,
  minAgeFilter,
  maxAgeFilter,
  activeFilter,
  toggleFilterMenu,
  fetchMembers,
  filteredMembers,
  currentPage,
  totalPages,
  paginatedMembers,
  nextPage,
  prevPage,
  toggleSelection,
  toggleSelectAll,
  isAllSelected,
  getSelectedMembersData,
  printSelected,
  calculateAge,
} = useMemberExportView();
</script>
"@
$styleImport2 = @"

<style scoped src="../styles/MemberExportView.css"></style>
"@
[System.IO.File]::WriteAllText($file2, $header2 + "`n" + ($template2 -join "`n") + $styleImport2, $enc)
Write-Host "MemberExportView.vue updated"

# 3. MemberPrintView.vue
$file3 = 'c:\xampp\htdocs\LTSDA2\frontend\src\components\MemberPrintView.vue'
$lines3 = Get-Content $file3 -Encoding UTF8
# Template starts at line 28 (index 27). Stop before 178 (index 177). Last index 176.
$template3 = $lines3[27..176]
$header3 = @"
<script setup lang="ts">
import { useMemberPrintView } from '../composables/useMemberPrintView';

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
});

const { printedBy } = useMemberPrintView();
</script>
"@
$styleImport3 = @"

<style scoped src="../styles/MemberPrintView.css"></style>
"@
[System.IO.File]::WriteAllText($file3, $header3 + "`n" + ($template3 -join "`n") + $styleImport3, $enc)
Write-Host "MemberPrintView.vue updated"

# 4. SettingsView.vue
$file4 = 'c:\xampp\htdocs\LTSDA2\frontend\src\components\SettingsView.vue'
$lines4 = Get-Content $file4 -Encoding UTF8
# Template starts at line 388 (index 387)
$template4 = $lines4[387..($lines4.Count - 1)]
$header4 = @"
<script setup lang="ts">
import { useSettingsView } from '../composables/useSettingsView';

const {
    user,
    form,
    imagePreview,
    selectedFile,
    isLoading,
    message,
    error,
    handleFileChange,
    saveSettings,
    activeTab,
    logs,
    usersList,
    showAddUserModal,
    showResetPasswordModal,
    deleteSearchQuery,
    deleteSearchResults,
    hasSearched,
    sqlFileInput,
    selectedSqlFile,
    isRestoring,
    newUser,
    resetUser,
    newPassword,
    filteredUsers,
    downloadBackup,
    handleSqlFileSelect,
    restoreDatabase,
    fetchLogs,
    fetchUsers,
    createUser,
    openResetPassword,
    resetPassword,
    searchMembersToDelete,
    confirmDeleteMember,
} = useSettingsView();
</script>
"@
[System.IO.File]::WriteAllText($file4, $header4 + "`n" + ($template4 -join "`n"), $enc)
Write-Host "SettingsView.vue updated"
