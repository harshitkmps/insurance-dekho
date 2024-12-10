/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from "react";
import Modal from "../elements/Modal";
import CloseIcon from "../../img/v2_close.svg";
import InputFieldV2 from "../elements/InputFieldV2";
import detect from "../../utils/detect";
import { createDispatchHook, createSelectorHook } from "react-redux";
import {
  addIdExclusiveBanner,
  deleteIdExclusiveBanner,
  editIdExclusiveBanner,
  getIdExclusiveBanner,
} from "../../redux/actions/IdExclusiveBannerActions";
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
} from "@mui/material";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../LearningModule/css/CommonGlobal.css";
import "../../components/elements/CustomDateRangeSelector.scss";
import { bannerFields } from "../../constants/IdExclusiveBannerFields";

const getStartDate = (days) => {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate = startDate.toISOString().split("T")[0];

  return startDate;
};

const formatDate = (date) => {
  const utc = new Date(date.getTime() + 330 * 60000);
  return utc.toISOString().split("T")[0];
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: {
        md: "40%",
        sm: "100%",
      },
    },
  },
  style: {
    zIndex: 10000000,
  },
};

const bannerFieldKeys = {};

bannerFields.forEach((bannerField) => {
  bannerFieldKeys[bannerField.key] = bannerField.value;
});

export default function IdExclusiveBannerPanel(props) {
  const useDispatch = createDispatchHook(props.context);
  const useSelector = createSelectorHook(props.context);
  const [addBannerFields, setAddBannerFields] = useState(bannerFieldKeys);
  const [addBannerClick, setAddBannerClick] = useState(false);
  const [multiSelectedLabels, setMultiSelectedLabels] = useState({
    add: {},
    edit: {},
  });
  const [showDateRange, setShowDateRange] = useState(false);
  const [editBanner, setEditBanner] = useState({
    bannerDetails: null,
    showPopup: false,
    editBannerFields: bannerFieldKeys,
  });
  const [snackBarOpen, setSnackBarOpen] = useState(false);

  const dispatch = useDispatch();
  const { status, banners, msg, tenants } = useSelector(
    (state) => state.IdExclusiveBannerReducer
  );

  const onBannerFieldChange = async (event, key, type) => {
    const {
      target: { value },
    } = event;
    const bannerFieldChangeObj = {
      add: () =>
        setAddBannerFields((prevState) => ({ ...prevState, [key]: value })),
      edit: () =>
        setEditBanner((prevState) => ({
          ...prevState,
          editBannerFields: { ...prevState.editBannerFields, [key]: value },
        })),
    };
    bannerFieldChangeObj[type]?.();
  };

  const handleMultiSelectChange = (
    value,
    key,
    options,
    isMultiSelect,
    type
  ) => {
    const selectedOptions = options
      .filter((option) => {
        if (typeof value === "number" || typeof value === "string") {
          return value === option.key ? option : null;
        } else {
          const stringifiedVal = value.toString();
          const stringifiedOptionKey = option.key.toString();
          return stringifiedVal.includes(stringifiedOptionKey) ? option : null;
        }
      })
      .map((option) => {
        return option.value;
      });

    setMultiSelectedLabels((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        [key]: selectedOptions,
      },
    }));
    if (!isMultiSelect) {
      value = [value];
    }
    const setBannerFields = {
      add: () =>
        setAddBannerFields((prevState) => ({
          ...prevState,
          [key]:
            typeof value === "string" && isMultiSelect
              ? value.split(",")
              : value,
        })),
      edit: () =>
        setEditBanner((prevState) => ({
          ...prevState,
          editBannerFields: {
            ...prevState.editBannerFields,
            [key]:
              typeof value === "string" && isMultiSelect
                ? value.split(",")
                : value,
          },
        })),
    };
    setBannerFields[type]?.();
  };

  const handleDateFilterChange = async (e, key, type) => {
    detect.isMobile() && document.body.classList.remove("gs-scroll");
    const setBannerFields = {
      add: () =>
        setAddBannerFields((prevState) => ({
          ...prevState,
          [key]: e.dateRange,
        })),
      edit: () =>
        setEditBanner((prevState) => ({
          ...prevState,
          editBannerFields: {
            ...prevState.editBannerFields,
            [key]: e.dateRange,
          },
        })),
    };
    setBannerFields[type]?.();
    setAddBannerFields((prevState) => ({
      ...prevState,
      [key]: e.dateRange,
    }));
  };

  const onDateFilterClose = () => {
    setShowDateRange(false);
  };

  const onDateFilterApply = () => {
    setShowDateRange(false);
  };

  const handleAddBannerClick = async (type) => {
    setAddBannerClick(true);
    const bannerUpdateFields =
      type === "add" ? addBannerFields : editBanner.editBannerFields;
    if (
      !bannerUpdateFields.appBannerLink ||
      !bannerUpdateFields.webBannerLink
    ) {
      return;
    }
    const bannerBody = {
      targetLOBs: ["POS"],
      typeOfContent: "banner",
      contentProps: {
        links: {
          app: bannerUpdateFields.appBannerLink,
          web: bannerUpdateFields.webBannerLink,
        },
        cta: {
          app: bannerUpdateFields.appBannerCta,
          web: bannerUpdateFields.webBannerCta,
        },
        loginBanner: bannerUpdateFields.loginBanner === "true",
      },
      criteria: {
        dateRange: {
          from: formatDate(bannerUpdateFields.viewDateRange.startDate),
          to: formatDate(bannerUpdateFields.viewDateRange.endDate),
        },
        conditions: [],
      },
    };
    bannerFields.forEach((bannerField) => {
      if (bannerField.criteria && bannerField.condition) {
        const valSelected = bannerUpdateFields[bannerField.key];
        if (!valSelected?.length || valSelected?.[0] === "all") {
          return;
        }

        const conditionObj = {
          match: true,
          value: [],
          key: bannerField.key,
          type: "array",
        };

        if (valSelected?.[0] === "notNull") {
          conditionObj.match = false;
          conditionObj.value = [null, "", 0];
        } else if (valSelected?.[0] === "null") {
          conditionObj.value = [null, "", 0];
        } else {
          conditionObj.value = valSelected;
        }
        bannerBody.criteria.conditions.push(conditionObj);
      }
    });
    const dispatchMapper = {
      add: () => {
        dispatch(addIdExclusiveBanner(bannerBody));
        setAddBannerFields(bannerFieldKeys);
        setAddBannerClick(false);
      },
      edit: () => {
        dispatch(
          editIdExclusiveBanner({
            id: editBanner.bannerDetails._id,
            body: {
              contentProps: bannerBody.contentProps,
              criteria: bannerBody.criteria,
            },
          })
        );
        closeEditBanner();
      },
    };

    dispatchMapper[type]?.();
  };

  const isInValidateString = (value, title) => {
    if (!addBannerClick) {
      return "";
    }
    if (value?.trim()?.length) {
      return "";
    }
    return `The ${title} field is required.`;
  };

  const closeEditBanner = () => {
    setEditBanner((prevState) => ({
      ...prevState,
      showPopup: false,
    }));
  };

  const handleEditPopup = (item) => {
    const editBannerFieldValues = {
      appBannerCta: item.contentProps.cta.app ?? "",
      appBannerLink: item.contentProps.links.app ?? "",
      webBannerCta: item.contentProps.cta.web ?? "",
      webBannerLink: item.contentProps.links.web ?? "",
      viewDateRange: {
        startDate: new Date(item.criteria?.dateRange?.from),
        endDate: new Date(item.criteria?.dateRange?.to),
        key: "dateRange",
      },
      loginBanner: item.contentProps.loginBanner ?? false,
    };

    bannerFields.forEach((field) => {
      if (
        field.type !== "singleSelectDropdown" &&
        field.type !== "multiSelectDropdown"
      ) {
        return;
      }
      const conditionObj = item.criteria.conditions.find(
        (condition) => condition.key === field.key
      );
      const isMultiSelect = field.type === "multiSelectDropdown";
      const value = conditionObj?.value;
      let transformedVal = "";
      if (!isMultiSelect) {
        if (conditionObj?.match && value?.includes(null)) {
          editBannerFieldValues[field.key] = ["null"];
          transformedVal = "null";
        } else if (!conditionObj?.match && value?.includes(null)) {
          editBannerFieldValues[field.key] = ["notNull"];
          transformedVal = "notNull";
        } else {
          editBannerFieldValues[field.key] = value?.length ? value : "";
          transformedVal = value?.length ? value : "";
        }
      } else {
        editBannerFieldValues[field.key] = value ?? [];
        transformedVal = value ?? [];
      }
      handleMultiSelectChange(
        transformedVal,
        field.key,
        field.options,
        isMultiSelect,
        "edit"
      );
    });

    setEditBanner((prevState) => ({
      ...prevState,
      showPopup: true,
      bannerDetails: item,
      editBannerFields: editBannerFieldValues,
    }));
  };

  const handleDeleteBanner = (banner) => {
    dispatch(deleteIdExclusiveBanner({ id: banner._id }));
  };

  const handleSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackBarOpen(false);
  };

  const renderBannerInputFields = (field, index, type) => {
    const value =
      type === "add"
        ? addBannerFields[field.key]
        : editBanner.editBannerFields[field.key];
    if (field.type === "textField") {
      return (
        <div key={field.key} className="idExclusiveAddBannerInputField">
          <InputFieldV2
            inputProps={{
              id: index,
              type: "text",
              name: field.title,
              value,
              onChange: (e) => onBannerFieldChange(e, field.key, type),
            }}
            labelProps={{
              label: field.title,
            }}
            className={`left1rem ${index % 2 === 1 ? "" : "mr-20"}`}
          />
          {field.required && isInValidateString(value, field.title) && (
            <div className="srv-validation-message">
              {isInValidateString(value, field.title)}
            </div>
          )}
        </div>
      );
    }
    if (
      field.type === "multiSelectDropdown" ||
      field.type === "singleSelectDropdown"
    ) {
      return (
        <div
          key={field.key}
          className={`idExclusiveAddBannerMultiSelect ${
            index % 2 === 1 ? "mr-15" : ""
          }`}
        >
          <FormControl
            sx={{
              fontSize: "18px",
              mb: "15px",
              width: {
                md: index % 2 === 1 ? "95%" : "100%",
                xs: "100%",
              },
            }}
          >
            <InputLabel id={field.key} sx={{ fontSize: "15px", py: "auto" }}>
              {field.title}
            </InputLabel>
            <Select
              labelId={field.key}
              id={`${field.key}-checkbox`}
              multiple={field.type === "multiSelectDropdown"}
              value={value}
              defaultValue={field.defaultValue}
              onChange={(e) =>
                handleMultiSelectChange(
                  e.target.value,
                  field.key,
                  field.options,
                  field.type === "multiSelectDropdown",
                  type
                )
              }
              input={
                <OutlinedInput
                  label={field.title}
                  sx={{
                    fontSize: "14px",
                    "& .MuiSelect-select": {
                      padding: "15px 14px",
                    },
                    "& .MuiOutlinedInput-notchedOutline legend": {
                      fontSize: "1.25rem",
                    },
                  }}
                />
              }
              renderValue={() =>
                field.type === "multiSelectDropdown"
                  ? multiSelectedLabels?.[type]?.[field.key]?.join(", ")
                  : multiSelectedLabels?.[type]?.[field.key]
              }
              MenuProps={MenuProps}
            >
              {field.options.map((option) => {
                return (
                  <MenuItem key={option.key} value={option.key}>
                    {field.type === "multiSelectDropdown" && (
                      <Checkbox
                        checked={value?.some(
                          (itemOption) => itemOption === option.key
                        )}
                        sx={{
                          "& .MuiSvgIcon-root": {
                            fontSize: "24px",
                          },
                        }}
                      />
                    )}
                    <ListItemText
                      primary={option.value}
                      sx={{
                        "& .MuiTypography-root": {
                          fontSize: "15px",
                        },
                      }}
                    />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>
      );
    }
    if (field.type === "dateRange") {
      return (
        <div
          key={field.key}
          className="idExclusiveAddBannerInputField flexWidth48p"
        >
          <InputFieldV2
            inputProps={{
              id: index,
              type: "text",
              name: field.title,
              value: `${formatDate(value.startDate)} to ${formatDate(
                value.endDate
              )}`,
              readOnly: true,
              onClick: () => setShowDateRange(true),
            }}
            labelProps={{
              label: field.title,
            }}
            className="left1rem"
          />
          {showDateRange && (
            <div className="filterDropdown">
              <div className="filterHeader">
                <h2>Select Date Range</h2>
                <Button variant="contained" onClick={onDateFilterApply}>
                  Apply
                </Button>
                <img onClick={onDateFilterClose} src={CloseIcon} alt="close" />
              </div>
              <DateRange
                className="fb_daterange"
                onChange={(e) => handleDateFilterChange(e, field.key, type)}
                direction="vertical"
                minDate={new Date()}
                maxDate={new Date(getStartDate(-365))}
                scroll={{ enabled: true }}
                ranges={[value]}
              />
            </div>
          )}
        </div>
      );
    }
    if (field.type === "radioBtn") {
      return (
        <div key={field.key} className="idExclusiveRadioBtnField">
          <FormControl className="idExclusiveRadioFormControl">
            <FormLabel
              sx={{
                fontSize: "16px",
                color: "#000000",
                mr: "20px",
              }}
              id={field.key}
            >
              {field.title}
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby={field.key}
              name="row-radio-buttons-group"
              sx={{
                "& .MuiTypography-root": { fontSize: "16px" },
              }}
              defaultValue={field.defaultValue}
              value={value}
              onChange={(e) => onBannerFieldChange(e, field.key, type)}
            >
              {field.options.map((option) => (
                <FormControlLabel
                  key={option.key}
                  value={option.key}
                  control={<Radio />}
                  label={option.value}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const options = {
      targetLOBs: "POS",
      typeOfContent: "banner",
      active: true,
    };
    dispatch(getIdExclusiveBanner(options));
  }, []);

  useEffect(() => {
    let timeoutId = setTimeout(function () {
      let element = document.getElementsByClassName("editBanSec");
      if (element && element[0]) element[0].classList.add("bottom0");
    }, 10);

    return () => {
      // Anything in here is fired on component unmount.
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [editBanner.showPopup]);

  useEffect(() => {
    if (status) {
      setSnackBarOpen(true);
    }
  }, [status]);

  useEffect(() => {
    if (tenants?.length) {
      for (const bannerField of bannerFields) {
        if (bannerField.key === "tenant_id") {
          bannerField.options = tenants;
        } else if (bannerField.key === "viewDateRange") {
          bannerField.value.endDate = new Date(getStartDate(-7));
        }
      }
    }
  }, [tenants]);

  if (props.userRole !== "admin" || !tenants?.length) {
    return null;
  }

  return (
    <>
      <div className="commonContainer980">
        <div
          className={
            props.moduleOptions.product !== "IDEDGE" ? "roundBorder" : ""
          }
        >
          {props.moduleOptions.product !== "IDEDGE" && (
            <h2>ID Exclusive Banners</h2>
          )}

          <div className="commonWidgets">
            <h3>Add Banner</h3>
            <div className="idExclusiveAddBannerFieldsContainer">
              {bannerFields?.length &&
                bannerFields.map((field, index) =>
                  renderBannerInputFields(field, index, "add")
                )}
            </div>
            <button
              className="dark-btn"
              onClick={() => handleAddBannerClick("add")}
            >
              Add Banner
            </button>
          </div>
          <ul className="idExclusiveBannerGridStyle gridStyle">
            {banners?.length
              ? banners.map((banner) => {
                  return (
                    <li key={banner._id} style={{ height: "auto" }}>
                      <div className="imgbox">
                        <img
                          src={banner?.contentProps?.links?.web}
                          alt="Banner"
                        />
                      </div>
                      <div className="btnGrp">
                        <div className="wrapper">
                          <button
                            className="light-btn"
                            onClick={() => handleEditPopup(banner)}
                          >
                            Edit
                          </button>
                        </div>
                        <div className="wrapper">
                          <button
                            className="light-btn"
                            onClick={() => handleDeleteBanner(banner)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })
              : null}
          </ul>
        </div>
      </div>
      <Modal open={editBanner.showPopup}>
        <div
          className={
            detect.isDesktop()
              ? "w90p idExclusiveEditBannerPopup commonsteppopup"
              : "editBanSec"
          }
        >
          <h4 style={{ marginBottom: "15px" }}>Edit ID Exclusive Banner</h4>
          <div className="popup_closeBtn" onClick={closeEditBanner}>
            <img src={CloseIcon} alt="close" />
          </div>
          <div className="idExclusiveAddBannerFieldsContainer">
            {bannerFields?.length &&
              bannerFields.map((field, index) =>
                renderBannerInputFields(field, index, "edit")
              )}
          </div>

          <div className="btnGrp">
            <div className="wrapper">
              <button className="light-btn" onClick={closeEditBanner}>
                Cancel
              </button>
            </div>
            <div className="wrapper">
              <button
                className="dark-btn"
                onClick={() => handleAddBannerClick("edit")}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </Modal>
      {msg && (
        <Snackbar
          open={snackBarOpen}
          autoHideDuration={5000}
          onClose={handleSnackBarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          style={{ alignItems: "center" }}
          sx={{
            "& .MuiAlert-root": {
              fontSize: "16px",
            },
            "& .MuiAlert-action": {
              alignItems: "center",
              WebkitAlignItems: "center",
              padding: "0 0 0 16px",
            },
          }}
        >
          <Alert
            onClose={handleSnackBarClose}
            severity={status === "SUCCESS" ? "success" : "error"}
            sx={{ width: "100%" }}
          >
            {msg}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
