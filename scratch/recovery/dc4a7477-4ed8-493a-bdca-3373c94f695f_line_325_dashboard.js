Created At: 2026-06-16T23:18:53Z
Completed At: 2026-06-16T23:18:53Z
File Path: `file:///home/ubuntu/zero-lab-bots/vivy/server/public/dashboard.js`
Total Lines: 1024
Total Bytes: 41778
Showing lines 950 to 1024
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
950:             item.innerHTML = `
951:                 <span>${opt.text}</span>
952:                 <span class="custom-multiselect-option-check"><i class="fa-solid fa-check"></i></span>
953:             `;
954: 
955:             item.addEventListener('click', (e) => {
956:                 e.stopPropagation();
957:                 if (isMultiple) {
958:                     opt.selected = !opt.selected;
959:                 } else {
960:                     select.value = opt.value;
961:                     nativeOptions.forEach(o => o.selected = (o.value === opt.value));
962:                     wrap.classList.remove('open');
963:                 }
964:                 select.dispatchEvent(new Event('change'));
965:                 syncCustomSelect(selectId, placeholder);
966:             });
967:             optionsList.appendChild(item);
968:         });
969:     }
970: 
971:     if (search && search.value) {
972:         filterOptions(wrap, search.value.toLowerCase());
973:     }
974: }
975: 
976: function filterOptions(wrap, query) {
977:     const options = wrap.querySelectorAll('.custom-multiselect-option');
978:     let hasMatch = false;
979:     options.forEach(opt => {
980:         const text = opt.querySelector('span').textContent.toLowerCase();
981:         if (text.includes(query)) {
982:             opt.style.display = 'flex';
983:             hasMatch = true;
984:         } else {
985:             opt.style.display = 'none';
986:         }
987:     });
988: 
989:     let noResults = wrap.querySelector('.custom-multiselect-no-results-filter');
990:     if (!hasMatch) {
991:         if (!noResults) {
992:             noResults = document.createElement('div');
993:             noResults.className = 'custom-multiselect-no-results custom-multiselect-no-results-filter';
994:             noResults.textContent = 'No results found';
995:             wrap.querySelector('.custom-multiselect-options-list').appendChild(noResults);
996:         }
997:     } else {
998:         if (noResults) noResults.remove();
999:     }
1000: }
1001: 
1002: function initAllCustomSelects() {
1003:     document.querySelectorAll('select').forEach(select => {
1004:         initCustomSelect(select);
1005:     });
1006: }
1007: 
1008: // Close dropdowns on outside click
1009: document.addEventListener('click', (e) => {
1010:     document.querySelectorAll('.custom-multiselect-wrap.open').forEach(wrap => {
1011:         if (!wrap.contains(e.target)) {
1012:             wrap.classList.remove('open');
1013:             const search = wrap.querySelector('.custom-multiselect-search');
1014:             if (search) {
1015:                 search.value = '';
1016:                 filterOptions(wrap, '');
1017:             }
1018:         }
1019:     });
1020: });
1021: 
1022: /* ---------- Boot ---------- */
1023: window.addEventListener('DOMContentLoaded', initDashboard);
1024: 
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
