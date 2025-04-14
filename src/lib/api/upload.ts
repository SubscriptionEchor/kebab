interface UploadResponse {
  success: boolean;
  message?: string;
  url?: string;
  code?: string;
}

export async function uploadImage(formData: FormData): Promise<UploadResponse> {
  try {
    // Get auth token from localStorage
    const authData = localStorage.getItem('kebab_admin_auth');
    const token = authData ? JSON.parse(authData).token : null;
    
    if (!token) {
      console.error('No auth token found for image upload');
      throw new Error('No authentication token found');
    }

    const response = await fetch('https://del-qa-api.kebapp-chefs.com/upload/imageUpload', {
      method: 'POST',
      body: formData,
      headers: { 
        'Authorization': `Bearer ${token}`,
        // Remove Content-Type header as it will be set automatically with form-data
      },
    });

    if (!response.ok) {
      console.error('Upload request failed:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      console.error('Upload failed:', data.message);
      throw new Error(data.message || 'Failed to upload image');
    }

    if (!data.url) {
      console.error('No image URL in response');
      throw new Error('No image URL received from server');
    }

    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}