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
  
  // Enable button if files are selected
  uploadBtn.disabled = fileUploader.files.length === 0;
});
/* MINIMAL WORKING VERSION */
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
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    const file = files[0]; // Start with just one file for testing
    
    console.log("Testing file upload with different methods...");
    
    // METHOD 1: Direct uploadFile with Blob
    console.log("Method 1: Using uploadFile with Blob");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const response = await ZOHO.CRM.API.uploadFile({
        Entity: moduleName,
        RecordId: recordId,
        File: new Blob([arrayBuffer], { type: file.type }),
        FileName: file.name
      });
      console.log("Method 1 success:", response);
      alert("File uploaded successfully!");
      fileUploader.value = "";
      return;
    } catch (err1) {
      console.log("Method 1 failed:", err1.message);
    }
    
    // METHOD 2: Using invoke with connection
    console.log("Method 2: Using connection invoke");
    try {
      const connections = await ZOHO.CRM.CONNECTION.list();
      if (connections && connections.length > 0) {
        const base64Data = await fileToBase64(file);
        const response = await ZOHO.CRM.CONNECTION.invoke(connections[0].name, {
          method: "POST",
          url: "/crm/v2/Attachments",
          params: {
            parent_id: recordId
          },
          body: JSON.stringify({
            data: [{
              File_Name: file.name,
              $file_attachment: base64Data
            }]
          })
        });
        console.log("Method 2 success:", response);
        alert("File uploaded successfully!");
        fileUploader.value = "";
        return;
      }
    } catch (err2) {
      console.log("Method 2 failed:", err2.message);
    }
    
    // METHOD 3: Using createRecord for Attachments
    console.log("Method 3: Using createRecord");
    try {
      const base64Data = await fileToBase64(file);
      const response = await ZOHO.CRM.API.createRecord({
        Entity: "Attachments",
        APIData: {
          Parent_Id: recordId,
          File_Name: file.name,
          $file_attachment: base64Data
        }
      });
      console.log("Method 3 success:", response);
      alert("File uploaded successfully!");
      fileUploader.value = "";
      return;
    } catch (err3) {
      console.log("Method 3 failed:", err3.message);
    }
    
    throw new Error("All upload methods failed");
    
  } catch (err) {
    console.error("Upload failed:", err);
    errorMsg.innerText = `Upload failed: ${err.message}. Please try a different file.`;
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Files";
  }
});

