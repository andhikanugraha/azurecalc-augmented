declare let $: any;
declare let initializeCalculator: any;

$(function() {
  let SERVICES_KEY = 'calculator.servicesv3';

  function createLinkElement(label, onclick) {
    let a = document.createElement('a');
    a.className = 'button toggle-service-picker';
    a.style.marginLeft = '30px';
    a.innerText = label;
    a.href = '#';
    a.addEventListener('click', function(e) {
      e.preventDefault();
      onclick(e);
    });

    return a;
  }

  function triggerExportJSON() {
    try {
      let servicesJson = window.localStorage.getItem(SERVICES_KEY);
      let servicesObj = JSON.parse(servicesJson);
      let now = new Date();
      let exportedObj = {
        version: '0.1',
        createdAt: now.toISOString(),
        data: [
          {
            key: SERVICES_KEY,
            transform: 'JSON.stringify',
            value: servicesObj
          }
        ]
      };
      let exportedJson = JSON.stringify(exportedObj, null, 2);
      let exportedBlob = new Blob([exportedJson]);
      let exportedBlobUrl = URL.createObjectURL(exportedBlob /* , {type: 'application/json'} */);

      const exportJsonForm = $('#exportJsonForm');
      const jsonBodyInput = $('#exportJsonForm input');
      jsonBodyInput.prop('value', exportedJson);
      exportJsonForm[0].submit();
    }
    catch (e) {
      console.error(e);
    }
  }

  function triggerImportJSON() {
    let input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.addEventListener('change', handleFileUpload);
    document.body.appendChild(input);
    input.click();
  }

  function handleFileUpload(e) {
    try {
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = function(e: any) {
        let importedJson = e.target.result;
        let importedObj = JSON.parse(importedJson);
        importedObj.data.forEach(function(entry) {
          let value = entry.value;
          if (entry.transform === 'JSON.stringify') {
            value = JSON.stringify(value);
          }
          localStorage.setItem(entry.key, value);
        });
        reloadCalculator();
      };
      reader.readAsText(file);
    }
    catch (e) {
      alert('Importing failed: ' + e.toString());
    }
  }

  function reloadCalculator() {
    location.reload();
  }

  function addButtons() {
    let a1 = createLinkElement('Export JSON', triggerExportJSON);
    let a2 = createLinkElement('Import JSON', triggerImportJSON);
    let div = document.querySelector('div.service-picker .banner-content');
    div.appendChild(a1);
    div.appendChild(a2);
  }

  function init() {
    addButtons();
  }

  init();
});
