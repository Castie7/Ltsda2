
$enc = [System.Text.Encoding]::UTF8
$file = 'c:\xampp\htdocs\LTSDA2\frontend\src\components\MemberExportView.vue'
$lines = Get-Content $file -Encoding UTF8
# Template starts at line 33 (index 32)
$template = $lines[32..($lines.Count - 1)]
$header = @"
<script setup lang="ts">
import { useMemberExportView } from '../composables/useMemberExportView';

const {
  router,
  selectedMembers,
  isLoading,
  searchQuery,
  statusFilter,
  genderFilter,
  civilStatusFilter,
  minAgeFilter,
  maxAgeFilter,
  activeFilter,
  toggleFilterMenu,
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
[System.IO.File]::WriteAllText($file, $header + "`n" + ($template -join "`n"), $enc)
Write-Host "MemberExportView.vue fixed"
