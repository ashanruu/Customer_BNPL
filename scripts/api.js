import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


 
//const BASE_DOMAIN = "https://merchant.bnpl.hexdive.com"; 
const BASE_DOMAIN = "http://192.168.43.68:5111";
const AUTH_DOMAIN = "https://auth.sing.hexdive.com";



// Endpoints
const ENDPOINTS = {
  otp: "/api/otp",   //Bearer token required  //naveen
  ticket: "/api/tickets", //with token //Kalana
  customer: "/api/customer", //with token //Kalana
  merchant: "/api/merchant", //with token //Kalana 
  auth: "/api/user", // Auth endpoint for authentication functions //naveen
  payment: "/api/payment",
  validation: "/api/validatecus",
  dochandle: "/api/dochandle" // Document upload endpoint
};

// Authentication function names that should use AUTH_DOMAIN
const AUTH_FUNCTIONS = [
  'LoginUser',
  'RegisterUser', 
  'SignUpUser',
  'VerifyMobileOtp',
  'SendOtp',
  'ResendOtp',
  'ForgotPassword',
  'ResetPassword',
  'RefreshToken'
];

// Helper function to determine if a function is auth-related
const isAuthFunction = (functionName) => {
  return AUTH_FUNCTIONS.some(authFunc => 
    functionName.toLowerCase().includes(authFunc.toLowerCase()) ||
    authFunc.toLowerCase().includes(functionName.toLowerCase())
  );
};

export const callMobileApi = async (
  functionName,
  payload,
  reference = "mobile-app-call",
  apiKey = "",
  endpointType = "main" // default to "main" instead of "user"
) => {
  try {
    console.log("Calling API with parameters:", endpointType);
    console.log("Function Name:", functionName);
    
    // Determine which domain to use based on function name
    const useAuthDomain = isAuthFunction(functionName) || endpointType === "auth";
    const domain = useAuthDomain ? AUTH_DOMAIN : BASE_DOMAIN;
    
    const endpointPath = ENDPOINTS[endpointType] || ENDPOINTS.main;
    const url = `${domain}${endpointPath}`;
    console.log("API URL:", url);
    console.log("Using domain:", useAuthDomain ? "AUTH_DOMAIN" : "BASE_DOMAIN");
    
    // Setup headers
    const headers = {
      'Content-Type': 'application/json',
    };


    if (!useAuthDomain || endpointType === "otp") {
      const token = await AsyncStorage.getItem('bearerToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
        console.log("Token attached to request");
      } else if (!useAuthDomain) {
        console.warn("No token found for BASE_DOMAIN request");
      }
    }
    
    // Add API Key if provided
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
    }

    console.log("Headers: ", headers);

    const response = await axios.post(
      url,
      {
        functionName,
        payload,
        reference,
      },
      { headers }
    );
    
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error Details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      requestData: error.config?.data
    });
    
    // Log the specific payload that caused the error
    if (error.response?.status >= 400) {
      console.error("Failed payload:", JSON.stringify(payload, null, 2));
    }
    
    throw error;
  }
};

// Convenience method for auth-specific API calls (forces AUTH_DOMAIN usage)
export const callAuthApi = async (
  functionName,
  payload,
  reference = "mobile-app-auth-call",
  apiKey = ""
) => {
  return callMobileApi(functionName, payload, reference, apiKey, "auth");
};


// Convenience method for authenticated API calls (forces BASE_DOMAIN usage with token)
export const callSecureApi = async (
  functionName,
  payload,
  reference = "mobile-app-secure-call",
  apiKey = "",
  endpointType = "main"
) => {
  try {
    console.log("Calling Secure API with BASE_DOMAIN");
    console.log("Function Name:", functionName);
    console.log("Payload:", payload);
    
    const endpointPath = ENDPOINTS[endpointType] || ENDPOINTS.main;
    const url = `${BASE_DOMAIN}${endpointPath}`;
    console.log("API URL:", url);
    
    // Setup headers with token for secure calls
    const headers = {
      'Content-Type': 'application/json',
    };

    // Always add token for secure API calls
    const token = await AsyncStorage.getItem('bearerToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log("Token attached to secure request");
    } else {
      console.warn("No token found for secure API call");
      throw new Error("Authentication token required for secure API calls");
    }
    
    // Add API Key if provided
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
    }

    console.log("Headers: ", headers);

    const response = await axios.post(
      url,
      {
        functionName,
        payload,
        reference,
      },
      { headers }
    );
    
    console.log("Secure API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Secure API Error Details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      requestData: error.config?.data
    });
    throw error;
  }
};

// Convenience method for fetching customer card data
export const fetchCustomerCard = async (customerId) => {
  try {
    console.log("Fetching customer card data for ID:", customerId);

    const response = await callMobileApi(
      'GetCusCard',
      { CustomerId: customerId },
      'mobile-app-customer-card',
      '',
      'customer'
    );

    console.log("GetCusCard response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching customer card:", error);
    throw error;
  }
};

// Convenience method for deleting customer card
export const deleteCustomerCard = async (jobId) => {
  try {
    console.log("Deleting customer card with job ID:", jobId);

    const response = await callMobileApi(
      'DeleteCard',
      { jobId: jobId },
      'mobile-app-delete-card',
      '',
      'payment'
    );

    console.log("DeleteCard response:", response);
    return response;
  } catch (error) {
    console.error("Error deleting customer card:", error);
    throw error;
  }
};

// Convenience method for fetching order details
export const fetchOrderDetails = async (orderId) => {
  try {
    console.log("=== API FETCH ORDER DETAILS DEBUG ===");
    console.log("Fetching order details for ID:", orderId);
    console.log("Sale code parameter:", { saleCode: orderId });
    console.log("Order ID type:", typeof orderId);
    console.log("Order ID length:", orderId ? orderId.length : 'undefined');
    console.log("====================================");

    const response = await callMobileApi(
      'GetCusSaleDetailId',
      { saleCode: orderId },
      'mobile-app-order-details',
      '',
      'customer'
    );

    console.log("GetCusSaleDetailId response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching order details:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Convenience method for creating loan with payment options
export const createLoan = async (saleId, noOfInstallment, isPayAtOnce = null) => {
  try {
    console.log("Creating loan for sale ID:", saleId, "with installments:", noOfInstallment);
    
    // Determine isPayAtOnce based on installment count if not explicitly provided
    const payAtOnce = isPayAtOnce !== null ? isPayAtOnce : (noOfInstallment === 1 ? 1 : 0);
    console.log("Payment mode - isPayAtOnce:", payAtOnce);

    const response = await callMobileApi(
      'CreateLoan',
      { 
        saleId: saleId,
        noOfinstllment: noOfInstallment,
        isPayAtOnce: payAtOnce
      },
      'mobile-app-create-loan',
      '',
      'payment'
    );

    console.log("createLoan response:", response);
    return response;
  } catch (error) {
    console.error("Error creating loan:", error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    console.log("Sending forgot password request for email:", email);

    const response = await callAuthApi(
      'ForgotPassword',
      { identifier: email },
      'mobile-app-forgot-password'
    );

    console.log("ForgotPassword response:", response);
    return response;
  } catch (error) {
    console.error("Error sending forgot password:", error);
    throw error;
  }
};

export const verifyRecoveryOtp = async (otpReferenceNum, otp) => {
  try {
    console.log("Verifying recovery OTP with reference:", otpReferenceNum);

    const response = await callAuthApi(
      'VerifyRecoveryOtp',
      { 
        otpReferenceNum: otpReferenceNum,
        otp: otp 
      },
      'mobile-app-verify-recovery-otp'
    );

    console.log("VerifyRecoveryOtp response:", response);
    return response;
  } catch (error) {
    console.error("Error verifying recovery OTP:", error);
    throw error;
  }
};

export const resetPassword = async (recoveryReferenceNum, newPassword) => {
  try {
    console.log("Resetting password with recovery reference:", recoveryReferenceNum);

    const response = await callAuthApi(
      'ResetPassword',
      { 
        recoveryReferenceNum: recoveryReferenceNum,
        newPassword: newPassword
      },
      'mobile-app-reset-password'
    );

    console.log("ResetPassword response:", response);
    return response;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Convenience method for customer validation
export const validateCustomer = async (phoneNumber) => {
  try {
    console.log("Validating customer with phone number:", phoneNumber);

    const response = await callMobileApi(
      'validatecus',
      { 
        PhoneNumber: phoneNumber
      },
      'mobile-app-validate-customer',
      '',
      'validation'
    );

    console.log("validatecus response:", response);
    return response;
  } catch (error) {
    console.error("Error validating customer:", error);
    throw error;
  }
};

// Convenience method for document upload
export const uploadDocument = async (documentBase64, documentType, fileName, fileType = 1) => {
  try {
    console.log(`Uploading document of type: ${documentType}, filename: ${fileName}, fileType: ${fileType}`);

    const response = await callMobileApi(
      'UploadDocument',
      { 
        document: [
          {
            FileName: fileName,
            Base64: documentBase64,
            FileType: fileType,
          }
        ]
      },
      'mobile-app-document-upload',
      '',
      'dochandle'
    );

    console.log("UploadDocument response:", response);
    return response;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

export const fetchCustomerDocApproveStatus = async () => {
  try {
    console.log("Fetching customer document approval status");

    const response = await callMobileApi(
      'GetCustomerDocApproveStatus',
      {},
      'mobile-app-doc-approve-status',
      '',
      'customer'
    );

    console.log("GetCustomerDocApproveStatus response:", response);
    return response;
  } catch (error) {
    console.error("Error fetching customer document approval status:", error);
    throw error;
  }
};

// Convenience method for paying an installment
export const payInstallment = async (installmentId, saleId) => {
  try {
    console.log("Processing installment payment for installmentId:", installmentId, "saleId:", saleId);
    console.log("Types - installmentId:", typeof installmentId, "saleId:", typeof saleId);
    
    // Ensure both parameters are integers
    const payload = { 
      installmentId: parseInt(installmentId),
      saleId: parseInt(saleId)
    };
    
    console.log("Final payload:", JSON.stringify(payload, null, 2));

    const response = await callMobileApi(
      'PayInstallment',
      payload,
      'mobile-app-pay-installment',
      '',
      'customer'
    );

    console.log("PayInstallment response:", response);
    return response;
  } catch (error) {
    console.error("Error processing installment payment:", error);
    throw error;
  }
};