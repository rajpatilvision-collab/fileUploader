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
    return;
  }
  
  // Enable button if files are selected
  uploadBtn.disabled = fileUploader.files.length === 0;
});

/* UPLOAD FILES */
/* UPLOAD FILES */
uploadBtn.addEventListener("click", async () => {
  // ... validation code ...

  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      const response = await ZOHO.CRM.CONNECTION.invoke("my_connection", {
        method: "POST",
        url: `/${moduleName}/${recordId}/Attachments`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attachment: base64Data,
          file_name: file.name,
          file_type: file.type
        })
      });

      console.log(`File ${i + 1} upload response:`, response);
    }

    alert(`Successfully uploaded ${files.length} file(s) ✔`);
    fileUploader.value = "";
    
  } catch (err) {
    console.error("Upload failed:", err);
    errorMsg.innerText = `Upload failed: ${err.message}`;
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Files";
  }
});

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}
