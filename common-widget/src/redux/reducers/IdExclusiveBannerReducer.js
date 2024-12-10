import * as constants from "../constants";
const defaultState = {
  banners: [],
  status: null,
  msg: null,
  tenants: [],
};

const IdExclusiveBannerReducer = (state = defaultState, action) => {
  switch (action.type) {
    case constants.GET_ID_EXCLUSIVE_BANNER: {
      return {
        ...state,
      };
    }
    case constants.SET_ID_EXCLUSIVE_BANNER: {
      return {
        ...state,
        banners: [...state.banners, ...action.payload],
      };
    }
    case constants.ADD_ID_EXCLUSIVE_BANNER: {
      return {
        ...state,
      };
    }
    case constants.ADD_ID_EXCLUSIVE_BANNER_STATUS: {
      return {
        ...state,
        banners: [action.payload.contentDetails, ...state.banners],
        status: action.payload.status,
        msg: action.payload.successMsg,
      };
    }
    case constants.EDIT_ID_EXCLUSIVE_BANNER: {
      return {
        ...state,
      };
    }
    case constants.EDIT_ID_EXCLUSIVE_BANNER_STATUS: {
      return {
        ...state,
        banners: state.banners.map((banner) =>
          banner._id === action.payload.banner._id
            ? action.payload.banner
            : banner
        ),
        status: action.payload.status,
        msg: action.payload.successMsg,
      };
    }
    case constants.DELETE_ID_EXCLUSIVE_BANNER: {
      return {
        ...state,
      };
    }
    case constants.DELETE_ID_EXCLUSIVE_BANNER_STATUS: {
      return {
        ...state,
        banners: state.banners.filter(
          (banner) => banner._id !== action.payload.bannerId
        ),
        msg: null,
        status: null,
      };
    }
    case constants.GET_TENANTS_LIST: {
      return { ...state };
    }
    case constants.SET_TENANTS_LIST: {
      const tenants = action.payload.map((tenant) => ({
        key: tenant.id,
        value: tenant.name,
      }));
      return { ...state, tenants };
    }
    default:
      return state;
  }
};
export default IdExclusiveBannerReducer;
