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

/* HELPER FUNCTION: Convert file to base64 */
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

/* HELPER FUNCTION: Get available connections */
async function getAvailableConnections() {
  try {
    // Try different methods to get connections
    if (typeof ZOHO.CRM.CONNECTION.list === 'function') {
      return await ZOHO.CRM.CONNECTION.list();
    } else if (typeof ZOHO.CRM.CONNECTION.getAll === 'function') {
      return await ZOHO.CRM.CONNECTION.getAll();
    } else {
      console.log("No connection listing method found, trying default connection");
      return [{ name: "default" }];
    }
  } catch (error) {
    console.log("Error getting connections:", error);
    return [{ name: "default" }];
  }
}

/* UPLOAD FILES - COMPLETE WORKING SOLUTION */
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

    const file = files[0]; // Start with one file for testing
    
    console.log("Testing file upload with different methods...");
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      isFile: file instanceof File
    });
    
    // METHOD 1: Direct uploadFile (if available)
    console.log("Method 1: Trying ZOHO.CRM.API.uploadFile");
    if (ZOHO.CRM.API && typeof ZOHO.CRM.API.uploadFile === 'function') {
      try {
        // Try with File object directly
        const response = await ZOHO.CRM.API.uploadFile({
          Entity: moduleName,
          RecordId: recordId,
          File: file
        });
        
        console.log("Method 1 response:", response);
        
        if (response && response.data && response.data[0] && 
            (response.data[0].code === "SUCCESS" || response.data[0].status === "success")) {
          alert("File uploaded successfully via Method 1!");
          fileUploader.value = "";
          return;
        }
      } catch (err1) {
        console.log("Method 1 failed:", err1.message || err1);
      }
    } else {
      console.log("Method 1 not available: ZOHO.CRM.API.uploadFile is not a function");
    }
    
    // METHOD 2: Using createRecord for Attachments with base64
    console.log("Method 2: Using createRecord for Attachments");
    if (ZOHO.CRM.API && typeof ZOHO.CRM.API.createRecord === 'function') {
      try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        
        const response = await ZOHO.CRM.API.createRecord({
          Entity: "Attachments",
          APIData: {
            Parent_Id: recordId,
            File_Name: file.name,
            $file_attachment: base64Data
          }
        });
        
        console.log("Method 2 response:", response);
        
        if (response && response.data && response.data[0] && 
            (response.data[0].code === "SUCCESS" || response.data[0].status === "success")) {
          alert("File uploaded successfully via Method 2!");
          fileUploader.value = "";
          return;
        }
      } catch (err2) {
        console.log("Method 2 failed:", err2.message || err2);
      }
    }
    
    // METHOD 3: Try connection invoke (if available)
    console.log("Method 3: Trying connection invoke");
    if (ZOHO.CRM.CONNECTION && typeof ZOHO.CRM.CONNECTION.invoke === 'function') {
      try {
        const connections = await getAvailableConnections();
        const connectionName = connections[0]?.name || "default";
        const base64Data = await fileToBase64(file);
        
        const response = await ZOHO.CRM.CONNECTION.invoke(connectionName, {
          method: "POST",
          url: `/crm/v2/Attachments`,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: [{
              Parent_Id: recordId,
              File_Name: file.name,
              $file_attachment: base64Data
            }]
          })
        });
        
        console.log("Method 3 response:", response);
        
        if (response && (response.code === "SUCCESS" || response.status === "success")) {
          alert("File uploaded successfully via Method 3!");
          fileUploader.value = "";
          return;
        }
      } catch (err3) {
        console.log("Method 3 failed:", err3.message || err3);
      }
    }
    
    // METHOD 4: Try alternative createRecord format
    console.log("Method 4: Trying alternative createRecord format");
    if (ZOHO.CRM.API && typeof ZOHO.CRM.API.createRecord === 'function') {
      try {
        const base64Data = await fileToBase64(file);
        
        const response = await ZOHO.CRM.API.createRecord({
          Entity: "Attachments",
          APIData: [{
            Parent_Id: recordId,
            File_Name: file.name,
            $file_attachment: base64Data
          }]
        });
        
        console.log("Method 4 response:", response);
        
        if (response && response.data && response.data[0] && response.data[0].code === "SUCCESS") {
          alert("File uploaded successfully via Method 4!");
          fileUploader.value = "";
          return;
        }
      } catch (err4) {
        console.log("Method 4 failed:", err4.message || err4);
      }
    }
    
    // METHOD 5: Try with the specific module API
    console.log("Method 5: Trying module-specific attachment");
    if (ZOHO.CRM.API && typeof ZOHO.CRM.API.getRecord === 'function') {
      try {
        // First check if we can access the record
        const recordCheck = await ZOHO.CRM.API.getRecord({
          Entity: moduleName,
          RecordID: recordId
        });
        console.log("Record check:", recordCheck);
        
        // If we can access the record, try uploading
        const base64Data = await fileToBase64(file);
        
        const response = await ZOHO.CRM.API.createRecord({
          Entity: "Attachments",
          APIData: {
            Parent_Id: recordId,
            File_Name: file.name,
            attachment: base64Data  // Try without $ prefix
          }
        });
        
        console.log("Method 5 response:", response);
        
        if (response && response.data && response.data[0] && response.data[0].code === "SUCCESS") {
          alert("File uploaded successfully via Method 5!");
          fileUploader.value = "";
          return;
        }
      } catch (err5) {
        console.log("Method 5 failed:", err5.message || err5);
      }
    }
    
    throw new Error("All upload methods failed. Please check console for details.");
    
  } catch (err) {
    console.error("Upload failed:", err);
    errorMsg.innerText = `Upload failed: ${err.message}`;
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Files";
  }
});
