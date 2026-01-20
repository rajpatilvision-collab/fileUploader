let recordId = null;
ZOHO.embeddedApp.on("PageLoad", function (data) {

  // Widget MUST be opened from a record page
  if (!data || !data.EntityId || !data.EntityId.length) {
    alert("Please open this widget from a record page.");
    return;
  }

  recordId = data.EntityId[0];
});

ZOHO.embeddedApp.init();
function uploadFiles() {

  if (!recordId) {
    alert("Record context not available.");
    return;
  }

  const fileInput = document.getElementById("fileUploader");
  const files = fileInput.files;

  // Validation: no file
  if (!files || files.length === 0) {
    alert("Please select at least one file.");
    return;
  }

  // Validation: max 3 files
  if (files.length > 3) {
    alert("You can upload a maximum of 3 files only.");
    fileInput.value = "";
    return;
  }

  // Upload each file as attachment
  Array.from(files).forEach(file => {

    ZOHO.CRM.API.attachFile({
      Entity: "Accounts",      // 🔁 change if needed
      RecordID: recordId,
      File: file
    })
    .then(() => {
      console.log("Uploaded:", file.name);
    })
    .catch(err => {
      console.error("Upload failed:", file.name, err);
      alert("Upload failed for " + file.name);
    });

  });

  // Reset input
  fileInput.value = "";

  alert("Files uploaded successfully ✔");
}
