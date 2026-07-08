Created At: 2026-06-16T16:23:42Z
Completed At: 2026-06-16T16:23:42Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 961
Total Bytes: 39462
Showing lines 760 to 961
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
760:     try {
761:         const res = await fetch(`/api/guilds/${activeGuildId}/config/${moduleName}`, {
762:             method: 'POST',
763:             headers: { 'Content-Type': 'application/json' },
764:             body: JSON.stringify(data)
765:         });
766:         if (res.ok) return true;
767:         const err = await res.json().catch(() => ({}));
768:         showToast(err.error || 'Save failed.', 'error');
769:         return false;
770:     } catch {
771:         showToast('Network error.', 'error');
772:         return false;
773:     }
774: }
775: 
776: /* ---------- Custom Multi-Select Dropdown Component ---------- */
777: function initCustomMultiSelect(selectId, placeholder) {
778:     const select = document.getElementById(selectId);
779:     if (!select) return;
780: 
781:     let wrap = document.getElementById(`wrap-${selectId}`);
782:     if (!wrap) {
783:         wrap = document.createElement('div');
784:         wrap.className = 'custom-multiselect-wrap';
785:         wrap.id = `wrap-${selectId}`;
786: 
787:         const display = document.createElement('div');
788:         display.className = 'custom-multiselect-display';
789: 
790:         const tags = document.createElement('div');
791:         tags.className = 'custom-multiselect-tags';
792: 
793:         const search = document.createElement('input');
794:         search.type = 'text';
795:         search.className = 'custom-multiselect-search';
796:         search.placeholder = placeholder || 'Select...';
797: 
798:         display.appendChild(tags);
799:         display.appendChild(sea
<truncated 4869 bytes>
ppendChild(item);
911:         });
912:     }
913: 
914:     if (search.value) {
915:         filterOptions(wrap, search.value.toLowerCase());
916:     }
917: }
918: 
919: function filterOptions(wrap, query) {
920:     const options = wrap.querySelectorAll('.custom-multiselect-option');
921:     let hasMatch = false;
922:     options.forEach(opt => {
923:         const text = opt.querySelector('span').textContent.toLowerCase();
924:         if (text.includes(query)) {
925:             opt.style.display = 'flex';
926:             hasMatch = true;
927:         } else {
928:             opt.style.display = 'none';
929:         }
930:     });
931: 
932:     let noResults = wrap.querySelector('.custom-multiselect-no-results-filter');
933:     if (!hasMatch) {
934:         if (!noResults) {
935:             noResults = document.createElement('div');
936:             noResults.className = 'custom-multiselect-no-results custom-multiselect-no-results-filter';
937:             noResults.textContent = 'No results found';
938:             wrap.querySelector('.custom-multiselect-dropdown').appendChild(noResults);
939:         }
940:     } else {
941:         if (noResults) noResults.remove();
942:     }
943: }
944: 
945: // Close dropdowns on outside click
946: document.addEventListener('click', (e) => {
947:     document.querySelectorAll('.custom-multiselect-wrap.open').forEach(wrap => {
948:         if (!wrap.contains(e.target)) {
949:             wrap.classList.remove('open');
950:             const search = wrap.querySelector('.custom-multiselect-search');
951:             if (search) {
952:                 search.value = '';
953:                 filterOptions(wrap, '');
954:             }
955:         }
956:     });
957: });
958: 
959: /* ---------- Boot ---------- */
960: window.addEventListener('DOMContentLoaded', initDashboard);
961: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
