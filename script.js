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
  errorMsg.innerText = "";

  const files = Array.from(fileUploader.files);

  if (!files || files.length === 0) {
    errorMsg.innerText = "Please select at least one file.";
    return;
  }

  if (files.length > MAX_FILES) {
    errorMsg.innerText = `You can upload max ${MAX_FILES} files only.`;
    return;
  }

  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    // Get the OAuth token
    const oauthToken = await ZOHO.CRM.CONNECTION.getAuthToken();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("attachment", file);
      
      const response = await fetch(
        `https://www.zohoapis.com/crm/v2/${moduleName}/${recordId}/Attachments`,
        {
          method: "POST",
          headers: {
            "Authorization": `Zoho-oauthtoken ${oauthToken}`,
          },
          body: formData
        }
      );

      const result = await response.json();
      console.log(`File ${i + 1} upload response:`, result);
      
      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }
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
