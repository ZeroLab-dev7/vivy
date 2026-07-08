Created At: 2026-06-16T23:28:01Z
Completed At: 2026-06-16T23:28:02Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1057
Total Bytes: 42818
Showing lines 800 to 1057
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
800:         const err = await res.json().catch(() => ({}));
801:         showToast(err.error || 'Save failed.', 'error');
802:         return false;
803:     } catch {
804:         showToast('Network error.', 'error');
805:         return false;
806:     }
807: }
808: 
809: /* ---------- Unified Custom Select Component ---------- */
810: function initCustomSelect(select) {
811:     if (!select || select.dataset.customSelectInit) return;
812:     select.dataset.customSelectInit = 'true';
813: 
814:     const selectId = select.id || 'select-' + Math.random().toString(36).substr(2, 9);
815:     if (!select.id) select.id = selectId;
816: 
817:     const isMultiple = select.multiple;
818:     const placeholder = select.getAttribute('placeholder') || 
819:                         (select.options[0] && select.options[0].value === '' ? select.options[0].text : '') || 
820:                         (isMultiple ? 'Select options…' : 'Select an option…');
821: 
822:     // Create wrapper
823:     const wrap = document.createElement('div');
824:     wrap.className = `custom-multiselect-wrap ${isMultiple ? 'is-multiple' : 'is-single'}`;
825:     wrap.id = `wrap-${selectId}`;
826: 
827:     const display = document.createElement('div');
828:     display.className = 'custom-multiselect-display';
829: 
830:     const tags = document.createElement('div');
831:     tags.className = 'custom-multiselect-tags';
832: 
833:     const singleVal = document.createElement('span');
834:     singleVal.className = 'custom-select-value';
835: 
836:     if (isMultiple) {
837:         display.appen
<truncated 7255 bytes>
onst options = wrap.querySelectorAll('.custom-multiselect-option');
1011:     let hasMatch = false;
1012:     options.forEach(opt => {
1013:         const text = opt.querySelector('span').textContent.toLowerCase();
1014:         if (text.includes(query)) {
1015:             opt.style.display = 'flex';
1016:             hasMatch = true;
1017:         } else {
1018:             opt.style.display = 'none';
1019:         }
1020:     });
1021: 
1022:     let noResults = wrap.querySelector('.custom-multiselect-no-results-filter');
1023:     if (!hasMatch) {
1024:         if (!noResults) {
1025:             noResults = document.createElement('div');
1026:             noResults.className = 'custom-multiselect-no-results custom-multiselect-no-results-filter';
1027:             noResults.textContent = 'No results found';
1028:             wrap.querySelector('.custom-multiselect-options-list').appendChild(noResults);
1029:         }
1030:     } else {
1031:         if (noResults) noResults.remove();
1032:     }
1033: }
1034: 
1035: function initAllCustomSelects() {
1036:     document.querySelectorAll('select').forEach(select => {
1037:         initCustomSelect(select);
1038:     });
1039: }
1040: 
1041: // Close dropdowns on outside click
1042: document.addEventListener('click', (e) => {
1043:     document.querySelectorAll('.custom-multiselect-wrap.open').forEach(wrap => {
1044:         if (!wrap.contains(e.target)) {
1045:             wrap.classList.remove('open');
1046:             const search = wrap.querySelector('.custom-multiselect-search');
1047:             if (search) {
1048:                 search.value = '';
1049:                 filterOptions(wrap, '');
1050:             }
1051:         }
1052:     });
1053: });
1054: 
1055: /* ---------- Boot ---------- */
1056: window.addEventListener('DOMContentLoaded', initDashboard);
1057: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
