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

/* UPLOAD FILES */
/* UPLOAD FILES - RECOMMENDED APPROACH */
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

    const filesArray = Array.from(files);
    let successCount = 0;
    let failedFiles = [];
    
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      
      try {
        console.log(`Uploading file ${i + 1}/${filesArray.length}: ${file.name} (${file.type}, ${file.size} bytes)`);
        
        // APPROACH 1: Try uploadFile method if available
        if (ZOHO.CRM.API && ZOHO.CRM.API.uploadFile) {
          const response = await ZOHO.CRM.API.uploadFile({
            Entity: moduleName,
            RecordId: recordId,
            File: file
          });
          
          console.log("Upload response:", response);
          
          if (response && response.data && response.data[0] && response.data[0].code === "SUCCESS") {
            successCount++;
          } else {
            failedFiles.push(file.name);
          }
        } 
        // APPROACH 2: If uploadFile doesn't work, try the attachment API
        else if (ZOHO.CRM.API && ZOHO.CRM.API.createRecord) {
          // First, upload the file to get attachment ID
          const uploadResponse = await ZOHO.CRM.API.uploadFile?.({
            File: file
          });
          
          if (uploadResponse && uploadResponse.details) {
            // Then attach it to the record
            const attachResponse = await ZOHO.CRM.API.createRecord({
              Entity: "Attachments",
              APIData: {
                Parent_Id: recordId,
                $file_id: uploadResponse.details.id
              }
            });
            
            if (attachResponse && attachResponse.data && attachResponse.data[0].code === "SUCCESS") {
              successCount++;
            } else {
              failedFiles.push(file.name);
            }
          }
        }
        
      } catch (fileError) {
        console.error(`Failed to upload ${file.name}:`, fileError);
        failedFiles.push(file.name);
      }
      
      // Small delay between uploads
      if (i < filesArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Show result message
    if (successCount === filesArray.length) {
      alert(`Successfully uploaded all ${successCount} file(s) ✔`);
    } else if (successCount > 0) {
      alert(`Uploaded ${successCount} of ${filesArray.length} file(s). Failed: ${failedFiles.join(', ')}`);
    } else {
      alert(`Failed to upload any files. Please try again.`);
    }
    
    fileUploader.value = "";
    
  } catch (err) {
    console.error("Upload failed:", err);
    errorMsg.innerText = `Upload failed: ${err.message}`;
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Files";
  }
});
