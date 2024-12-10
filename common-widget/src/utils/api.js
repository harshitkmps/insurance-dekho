import axios from "axios";
import FormData from "form-data";
import querystring from 'querystring';

export function postFormData(url, params, headers) {
  var formData = new FormData();
  for (let key in params) {
    formData.append(key, params[key]);
  }
  var config = {
    method: "post",
    url: url,
    headers: headers,
    data: formData,
  };
  return axios(config);
}

export function postJsonData(url, params, headers) {
  var config = {
    method: "post",
    url: url,
    headers: { ...headers, "Content-Type": "application/json" },
    data: JSON.stringify(params),
  };
  return axios(config)
    .then((res) => {
      if (res.status === 200) {
        return res.data;
      }
    })
    .catch((error) => {
      console.error("POST API ERR: ", error);
      return {
        error: true,
        errMsg: error.toString(),
        errorResp: error.response.data,
      };
    });
}

export function getData(url, options, headers) {
  let axiosConf = {
    headers: headers
  };
  let qs = querystring.stringify(options)
  
  if (qs) {
    url += '&' + qs;
  }

  return axios.get(url, axiosConf)
    .then(res => {
      if (res.status === 200) {
        return res.data;
      }
    })
    .catch((error) => {
      console.error("API ERR: ", new Date().toString(), error.code, error.toString(), url);
      return { error: true, errMsg: error.toString(), errorResp: error };
    });
}

export function postDataWithPathParams(url,options,headers,pathParams){
  let path = '';
  pathParams.forEach((item)=>{
    path+=item+'/';
  })
  url += path;
  var config = {
    method: "post",
    url: url,
    headers: { ...headers, "Content-Type": "application/json" },
    data: JSON.stringify(options),
  };

  return axios(config)
    .then((res) => {
      if (res.status === 200) {
        return res.data;
      }
    })
    .catch((error) => {
      console.error("POST API ERR: ", error);
      return {
        error: true,
        errMsg: error.toString(),
        errorResp: error.response.data,
      };
  });
}
export function putJsonData(url, params, headers) {
  var config = {
    method: "put",
    url: url,
    headers: { ...headers, "Content-Type": "application/json" },
    data: JSON.stringify(params),
  };
  return axios(config)
    .then((res) => {
      if (res.status === 200) {
        return res.data;
      }
    })
    .catch((error) => {
      console.error("PUT API ERR: ", error);
      return {
        error: true,
        errMsg: error.toString(),
        errorResp: error.response.data,
      };
    });
}