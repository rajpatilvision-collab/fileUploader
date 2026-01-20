let moduleName = null;
let recordId = null;
const MAX_FILES = 3;

const uploadBtn = document.getElementById('uploadBtn');
const errorMsg = document.getElementById('errorMsg');
const fileUploader = document.getElementById('fileUploader');

uploadBtn.disabled = true;

/* INIT */
ZOHO.embeddedApp.on("PageLoad", function (data) {
  console.log("PageLoad data:", data);

  if (!data || !data.Entity || !data.EntityId || !data.EntityId.length) {
    errorMsg.innerText = "Open this widget from a record page.";
    return;
  }

  moduleName = data.Entity;           // e.g. Accounts
  recordId = data.EntityId[0];        // ✅ MUST be index 0

  uploadBtn.disabled = false;
});

ZOHO.embeddedApp.init();

/* FILE SELECTION VALIDATION */
fileUploader.addEventListener("change", () => {
  errorMsg.innerText = "";

  if (fileUploader.files.length > MAX_FILES) {
    errorMsg.innerText = `You can upload a maximum of ${MAX_FILES} files only.`;
    fileUploader.value = "";
  }
});

/* UPLOAD FILES TO ATTACHMENTS */
uploadBtn.addEventListener("click", async () => {
  errorMsg.innerText = "";

  const files = fileUploader.files;

  if (!files || files.length === 0) {
    errorMsg.innerText = "Please select at least one file.";
    return;
  }

  if (files.length > MAX_FILES) {
    errorMsg.innerText = `You can upload max ${MAX_FILES} files only.`;
    return;
  }

  try {
    for (const file of files) {
      console.log("Uploading:", file.name);

      await ZOHO.CRM.API.attachFile({
        Entity: moduleName,
        RecordID: recordId,
        File: file          // ✅ REAL FILE OBJECT
      });
    }

    alert("Files uploaded successfully ✔");
    fileUploader.value = "";

  } catch (err) {
    console.error("Upload failed:", err);
    errorMsg.innerText = "Upload failed. Please try again.";
  }
});
