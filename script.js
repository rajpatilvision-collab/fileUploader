let moduleName = null;
let recordId = null;
const MAX_FILES = 3;

const uploadBtn = document.getElementById("uploadBtn");
const errorMsg = document.getElementById("errorMsg");
const fileUploader = document.getElementById("fileUploader");

uploadBtn.disabled = true;

/* INIT */
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

/* FILE VALIDATION */
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

/* UPLOAD FILES */
uploadBtn.addEventListener("click", async () => {
  errorMsg.innerText = "";

  const files = fileUploader.files;

  if (!files || files.length === 0) {
    errorMsg.innerText = "Please select at least one file.";
    return;
  }

  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    // 🔁 Upload files one by one
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      console.log(`Uploading file ${i + 1}:`, file.name);

      // Convert File → Blob
      const blob = new Blob([file], { type: file.type });

      const response = await ZOHO.CRM.API.attachFile({
        Entity: moduleName,
        RecordID: recordId,
        File: {
          Name: file.name,
          Content: blob
        }
      });

      console.log(`Response for ${file.name}:`, response);

      if (
        !response ||
        !response.data ||
        !response.data[0] ||
        response.data[0].code !== "SUCCESS"
      ) {
        throw new Error(`Upload failed for file: ${file.name}`);
      }
    }

    alert("All files uploaded successfully!");
    fileUploader.value = "";

  } catch (err) {
    console.error(err);
    errorMsg.innerText = err.message || "Upload failed.";
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
  }
});
