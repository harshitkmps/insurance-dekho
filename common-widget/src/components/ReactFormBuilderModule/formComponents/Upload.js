/* eslint-disable import/no-anonymous-default-export */
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Box from "@mui/material/Box";
import { createDispatchHook, createSelectorHook } from "react-redux";
import { useDropzone } from "react-dropzone";
import CardMedia from "@mui/material/CardMedia";
import PdfIcon from '../../../img/ic-pdf.svg';
import CircularProgress from '@mui/material/CircularProgress';
import "./css/upload.scss";

export default function (props) {
  const useSelector = createSelectorHook(props.context);
  const useDispatch = createDispatchHook(props.context);
  const dispatch = useDispatch();
  let activeStep = useSelector(
    (state) => state.ReactFormBuilderReducer.activeStep
  );
  let step = useSelector(
    (state) => state.ReactFormBuilderReducer.steps[props.activeStep]
  );
  let field = useSelector(
    (state) =>
      state.ReactFormBuilderReducer.steps[props.activeStep].fields[props.field.name]
  );
  let handleChange = function (files) {
    let file = files.pop();
    let fileUrl = URL.createObjectURL(file);
    let value = { url: fileUrl, name: file.name };
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: value,
        field: props.field.name,
      },
    });
    dispatch({
      type: "VALIDATE_FIELD_VALUE",
      payload: {
        field: field,
      },
    });

    if (field.onChange) {
      field.onChange(file, step, (newstep) => {
        if (newstep) {
          dispatch({
            type: "UPDATE_STEP",
            payload: { step: newstep },
          });
        }
      });
    }
  };
  let helperText = field.helperText;
  // delete field.helperText;
  let error = field.error;
  // delete field.error;
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxSize: field.maxSize || 10000000,
    minSize: field.minSize || 10,
    accept: field.accept || {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: false,
    onDrop: handleChange,
  });
  function uploadArea() {
    return (
      <div>
        <div className="demoImg">
          <input {...getInputProps()} />
          {field.icon && (
            <CardMedia 
              component="img"
              image={field.icon}
              sx={{ }}
            />
          )}
        
        </div>
        <span>{`${field.label}`}</span>
      </div>
    );
  }

  function uploadAreaPDF() {
    return (
      <div className={field.value ? "pdfview" : "demoImg"}>
        <div>
          <input {...getInputProps()} />
          {field.icon && (
            <CardMedia 
              component="img"
              image={field.icon}
              sx={{ }}
            />
          )}
        </div>
        <span>{`${field.label}`}</span>
      </div>
    );
  }

  function uploadedImages(data) {
    return (
      <div className="addedImg">
        { (field.value && field.value.doc_id) ? 
          <CardMedia
            component="img"
            image={data}
            sx={{
              borderRadius: "4px",
            }}
          />:
          <div className="uploadLoader">
            <CircularProgress />
          </div>
        }
        {/* <span>{`${field.label}`}</span> */}
      </div>
    );
  }

  function render(field) {
    if (field.value) {
      if(field.accept && field.accept['application/pdf']){
        if(field.value && field.value.doc_id){
          return <h3 className="pdfname">
            <img src={PdfIcon} alt="Pdf" height="64px" width="64px"/>
            </h3>;
        }
        else{
          return <div className="uploadLoader">
              <CircularProgress />
            </div>
        }
      }else {
        return uploadedImages(field.value.url);
      }
    } else {
      if(field.accept && field.accept['application/pdf']){
        return uploadAreaPDF();
      }else{
        return uploadArea();
      }
      
    }
  }

  function clearField(){
    dispatch({
      type: "UPDATE_FIELD_VALUE",
      payload: {
        value: "",
        field: field.name,
      },
    });
  }

  return (
    <FormControl error={error} id={field.id} className="imageUpload">
      {field.value && <span className="closeimage" onClick={clearField}></span>}
      <Box
        {...getRootProps({ className: "dropzone" })}
        component="span"
        sx={{
          p: 1,
          border: "2px dashed rgba(51, 56, 70, 0.15);",
          borderRadius: "12px",
          textAlign: "center",
          width: "100%"
        }}
      >
        {render(field)}
      </Box>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
