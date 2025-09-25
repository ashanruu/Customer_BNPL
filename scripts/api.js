import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


 
//const BASE_DOMAIN = "http://merchant.bnpl.hexdive.com"; 
const BASE_DOMAIN = "http://192.168.1.74:5111";
const AUTH_DOMAIN = "http://auth.sing.hexdive.com";


// Endpoints
const ENDPOINTS = {
  otp: "/api/otp",   //Bearer token required  //naveen
  ticket: "/api/tickets", //with token //Kalana
  customer: "/api/customer", //with token //Kalana
  merchant: "/api/merchant", //with token //Kalana 
  auth: "/api/user", // Auth endpoint for authentication functions //naveen
  payment: "/api/payment"
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

    // For non-auth functions (using BASE_DOMAIN), always add token
    // For auth functions (using AUTH_DOMAIN), only add token for specific endpoints like OTP
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

// Convenience method for merchant-specific API calls (forces BASE_DOMAIN usage with token)
export const callMerchantApi = async (
  functionName,
  payload,
  reference = "mobile-app-merchant-call",
  apiKey = ""
) => {
  return callMobileApi(functionName, payload, reference, apiKey, "merchant");
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
    console.log("Fetching order details for ID:", orderId);

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
    throw error;
  }
};

