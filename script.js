let moduleName = null;
let recordId = null;
const MAX_FILES = 3;

const uploadBtn = document.getElementById("uploadBtn");
const errorMsg = document.getElementById("errorMsg");
const fileUploader = document.getElementById("fileUploader");

uploadBtn.disabled = true;
ZOHO.embeddedApp.on("PageLoad", function (data) {
  if (!data || !data.Entity || !data.EntityId || !data.EntityId.length) {
    errorMsg.innerText = "Open this widget from a record page.";
    return;
  }

  moduleName = data.Entity;
  recordId = data.EntityId[0];

  uploadBtn.disabled = false;
  console.log(`Ready for: ${moduleName}/${recordId}`);
});

ZOHO.embeddedApp.init();

fileUploader.addEventListener("change", () => {
  errorMsg.innerText = "";

  if (fileUploader.files.length > MAX_FILES) {
    errorMsg.innerText = `You can upload maximum ${MAX_FILES} files only.`;
    fileUploader.value = "";
    uploadBtn.disabled = true;
    return;
  }
  
  uploadBtn.disabled = fileUploader.files.length === 0;
});

uploadBtn.addEventListener("click", async () => {
  errorMsg.innerText = "";

  if (!fileUploader.files || fileUploader.files.length === 0) {
    errorMsg.innerText = "Please select a file first.";
    return;
  }

  const file = fileUploader.files[0];

  console.log("Selected file:", file);

  try {
    // ✅ Convert File to Blob
    const blob = new Blob([file], { type: file.type });

    const response = await ZOHO.CRM.API.attachFile({
      Entity: moduleName,      // "Accounts"
      RecordID: recordId,      // record ID
      File: {
        Name: file.name,       // filename
        Content: blob          // 🔥 MUST be Blob
      }
    });

    console.log("Upload response:", response);

    if (
      response &&
      response.data &&
      response.data[0] &&
      response.data[0].code === "SUCCESS"
    ) {
      alert("File uploaded successfully!");
      fileUploader.value = "";
    } else {
      throw new Error("Upload failed");
    }

  } catch (err) {
    console.error(err);
    errorMsg.innerText = "Upload failed: " + err.message;
  }
});
