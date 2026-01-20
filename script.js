let recordId;

ZOHO.embeddedApp.on("PageLoad", function (data) {
  recordId = data.EntityId[0];
});
function uploadFiles() {
  const fileInput = document.getElementById("fileUploader");
  const files = fileInput.files;

  if (!files.length) {
    alert("Select at least one file");
    return;
  }

  if (files.length > 3) {
    alert("Max 3 files allowed");
    fileInput.value = "";
    return;
  }

  Array.from(files).forEach(file => {
    ZOHO.CRM.API.attachFile({
      Entity: "Accounts",
      RecordID: recordId,
      File: file
    });
  });

  alert("Upload complete");
  fileInput.value = "";
}

