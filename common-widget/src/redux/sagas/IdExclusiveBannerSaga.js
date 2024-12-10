import { put } from "redux-saga/effects";
import configs from "../../app-configs";
import { getData, postJsonData, putJsonData } from "../../utils/api";
import {
  addIdExclusiveBannerStatus,
  editIdExclusiveBannerStatus,
  setIdExclusiveBanner,
  deleteIdExclusiveBannerStatus,
  setTenantsList,
} from "../actions";

export function* addIdExclusiveBanner(data) {
  try {
    const res = yield postJsonData(
      configs.bffUrl + "/api/v1/content/add",
      data.payload,
      {}
    );
    if (!res.error) {
      yield put(
        addIdExclusiveBannerStatus({
          status: "SUCCESS",
          successMsg: "Banner Added Successfully!!",
          contentDetails: res.data.content,
        })
      );
    } else {
      yield put(
        addIdExclusiveBannerStatus({
          status: "FAILURE",
          successMsg: "Unable to Add Banner",
        })
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}

export function* getIdExclusiveBanner(data) {
  try {
    const res = yield getData(
      configs.bffUrl + "/api/v1/content/fetch?",
      data.payload
    );
    if (!res.error) {
      yield put(setIdExclusiveBanner(res.data.content));
    }
  } catch (error) {
    console.log("error", error);
  }
}

export function* editIdExclusiveBanner(data) {
  try {
    const res = yield putJsonData(
      configs.bffUrl + "/api/v1/content/update/" + data.payload.id,
      data.payload.body,
      {}
    );
    if (!res.error) {
      yield put(
        editIdExclusiveBannerStatus({
          status: "SUCCESS",
          successMsg: "Banner Updated Successfully!!",
          banner: {
            _id: data.payload.id,
            ...data.payload.body,
          },
        })
      );
    } else {
      yield put(
        editIdExclusiveBannerStatus({
          status: "FAILURE",
          successMsg: "Unable to update Banner",
        })
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}

export function* deleteIdExclusiveBanner(data) {
  try {
    const body = { active: false };
    const res = yield putJsonData(
      configs.bffUrl + "/api/v1/content/update/" + data.payload.id,
      body,
      {}
    );
    if (!res.error) {
      yield put(
        deleteIdExclusiveBannerStatus({
          status: "SUCCESS",
          successMsg: "Banner Deleted Successfully!!",
          bannerId: data.payload.id,
        })
      );
    } else {
      yield put(
        deleteIdExclusiveBannerStatus({
          status: "FAILURE",
          successMsg: "Unable to update Banner",
          id: data.payload.id,
        })
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}

export function* getTenantsList(data) {
  try {
    const res = yield getData(
      configs.bffUrl + "/api/v1/tenant/list",
      data.payload
    );
    if (!res.error) {
      yield put(setTenantsList(res.data.tenants));
    }
  } catch (error) {
    console.log("error", error);
  }
}
