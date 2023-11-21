import {makeStyles} from "@mui/styles";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState, useContext} from "react";
import {Link, Loading} from "../shared";
import {Button, Chip, Container, Paper, Typography} from "@mui/material";
import LoadingButton from "../shared/LoadingButton";
import {AlertDialog} from "../shared/Dialogs";
import {useSnackbar} from "notistack";
import {UserContext} from "../../context";
import ImpactReportField from "../shared/ImpactReportField";
import {updateIndicatorReport} from "../../api/indicatorReportApi";
import {reportErrorToBackend} from "../../api/errorReportApi";
import {isValidURL} from "../../helpers/validation_helpers";
import {createImpactReport, fetchImpactReport} from "../../api/impactReportAPI";
import {fetchOrganizations} from "../../api/organizationApi";
import {navigate, navigateHelper} from "../../helpers/navigatorHelper";
import GeneralField from "../shared/fields/GeneralField";
import SelectField from "../shared/fields/SelectField";
import Dropdown from "../shared/fields/MultiSelectField";
import {Add as AddIcon} from "@mui/icons-material";
import {createImpactModel} from "../../api/impactModelAPI";

const useStyles = makeStyles(() => ({
  root: {
    width: '80%'
  },
  button: {
    marginTop: 12,
    marginBottom: 0,
    length: 100
  },
}));


export default function AddEditImpactModel() {
  const navigator = useNavigate();
  const navigate = navigateHelper(navigator);
  const classes = useStyles();
  const {uri, orgUri, operationMode} = useParams();
  const mode = uri ? operationMode : 'new';
  const {enqueueSnackbar} = useSnackbar();
  const userContext = useContext(UserContext);

  const [state, setState] = useState({
    submitDialog: false,
    loadingButton: false,
  });
  const [errors, setErrors] = useState(
    {}
  );

  const [ops, setOps] = useState({
    organization: {}
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    organization: null,
    dateCreated: '',
    uri: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOrganizations()]).then(
      ([{organizations}]) => {
        const organizationsOps = {};
        organizations.map(organization => {
          organizationsOps[organization._uri] = organization.legalName;
        });
        setOps(ops => ({...ops, organization: organizationsOps}));
        setLoading(false);
      }
    ).catch(([e]) => {
      reportErrorToBackend(e);
      setLoading(false);
      enqueueSnackbar(e.json?.message || "Error occurs when fetching organizations", {variant: 'error'});
    });

  }, []);

  useEffect(() => {
    if ((mode === 'edit' && uri) || (mode === 'view' && uri)) {
      fetchImpactReport(encodeURIComponent(uri)).then(({success, impactReport}) => {
        if (success) {
          impactReport.uri = impactReport._uri;
          impactReport.organization = impactReport.forOrganization;
          impactReport.impactScale = impactReport.impactScale?.value?.numericalValue;
          impactReport.impactDepth = impactReport.impactDepth?.value?.numericalValue;
          setForm(impactReport);
          setLoading(false);
        }
      }).catch(e => {
        if (e.json)
          setErrors(e.json);
        reportErrorToBackend(e);
        setLoading(false);
        navigate(-1);
        enqueueSnackbar(e.json?.message || "Error occur", {variant: 'error'});
      });
    } else if (mode === 'edit' && (!uri || !orgUri)) {
      navigate(-1);
      enqueueSnackbar("No URI or orgUri provided", {variant: 'error'});
    } else if (mode === 'new' && !orgUri) {
      setLoading(false);
      // navigate(-1);
      // enqueueSnackbar("No orgId provided", {variant: 'error'});
    } else if (mode === 'new' && orgUri) {
      setForm(form => ({...form, organization: orgUri}));
      setLoading(false);
    } else {
      navigate(-1);
      enqueueSnackbar('Wrong auth', {variant: 'error'});
    }

  }, [mode, uri]);

  const handleSubmit = () => {
    if (validate()) {
      console.log(form);
      setState(state => ({...state, submitDialog: true}));
    }
  };

  const handleConfirm = () => {
    setState(state => ({...state, loadingButton: true}));
    if (mode === 'new') {
      createImpactModel({form}).then((ret) => {
        if (ret.success) {
          setState({loadingButton: false, submitDialog: false,});
          navigate(-1);
          enqueueSnackbar(ret.message || 'Success', {variant: "success"});
        }
      }).catch(e => {
        if (e.json) {
          setErrors(e.json);
        }
        console.log(e);
        reportErrorToBackend(e);
        enqueueSnackbar(e.json?.message || 'Error occurs when creating indicator report', {variant: "error"});
        setState({loadingButton: false, submitDialog: false,});
      });
    } else if (mode === 'edit' && uri) {
      updateIndicatorReport(encodeURIComponent(uri), {form}).then((res) => {
        if (res.success) {
          setState({loadingButton: false, submitDialog: false,});
          enqueueSnackbar(res.message || 'Success', {variant: "success"});
          navigate(`/impactReports/${encodeURIComponent(form.organization)}`);
        }
      }).catch(e => {
        if (e.json) {
          setErrors(e.json);
        }
        reportErrorToBackend(e);
        enqueueSnackbar(e.json?.message || 'Error occurs when updating outcome', {variant: "error"});
        setState({loadingButton: false, submitDialog: false,});
      });
    }

  };

  const validate = () => {
    const error = {};
    // if (!form.name)
    //   error.name = 'The field cannot be empty';
    // if (!form.comment)
    //   error.comment = 'The field cannot be empty';
    // if (!form.organization)
    //   error.organization = 'The field cannot be empty';
    // if (!form.indicator)
    //   error.indicator = 'The field cannot be empty';
    // if (!form.startTime)
    //   error.startTime = 'The field cannot be empty';
    // if (!form.endTime)
    //   error.endTime = 'The field cannot be empty';
    // if (form.uri && !isValidURL(form.uri))
    //   error.uri = 'The field cannot be empty';
    // if (!!form.startTime && !!form.endTime && form.startTime > form.endTime) {
    //   error.startTime = 'The date must be earlier than the end date';
    //   error.endTime = 'The date must be later than the start date';
    // }

    // if (!form.numericalValue)
    //   error.numericalValue = 'The field cannot be empty';
    // if (form.numericalValue && isNaN(form.numericalValue))
    //   error.numericalValue = 'The field must be a number';
    // if (!form.unitOfMeasure)
    //   error.unitOfMeasure = 'The field cannot be empty';
    // if (!form.dateCreated)
    //   error.dateCreated = 'The field cannot be empty';
    setErrors(error);
    return Object.keys(error).length === 0;
  };

  if (loading)
    return <Loading/>;

  return (
    <Container maxWidth="md">
      {mode === 'view' ? (
        <Paper sx={{p: 2}} variant={'outlined'}>

          <Typography variant={'h6'}> {`Name:`} </Typography>
          <Typography variant={'body1'}> {`${form.name || 'Not Given'}`} </Typography>
          <Typography variant={'h6'}> {`URI:`} </Typography>
          <Typography variant={'body1'}> {`${form.uri}`} </Typography>
          <Typography variant={'h6'}> {`Comment:`} </Typography>
          <Typography variant={'body1'}> {`${form.comment || 'Not Given'}`} </Typography>
          <Typography variant={'h6'}> {`Organization:`} </Typography>
          <Typography variant={'body1'}> <Link to={`/organizations/${encodeURIComponent(form.organization)}/view`}
                                               colorWithHover
                                               color={'#2f5ac7'}>{ops.organization[form.organization]}</Link>
          </Typography>

          <Typography variant={'h6'}> {`Impact Scale:`} </Typography>
          <Typography variant={'body1'}> {`${form.impactScale || 'Not Given'}`} </Typography>

          <Typography variant={'h6'}> {`Impact Depth:`} </Typography>
          <Typography variant={'body1'}> {`${form.impactDepth || 'Not Given'}`} </Typography>

          <Button variant="contained" color="primary" className={classes.button} onClick={() => {
            navigate(`/impactReport/${encodeURIComponent(uri)}/edit`);
          }
          }>
            Edit
          </Button>

        </Paper>
      ) : (<Paper sx={{p: 2, position: 'relative'}} variant={'outlined'}>
        <Typography variant={'h4'}> Impact Model </Typography>
        <GeneralField
          key={'name'}
          label={'Name'}
          value={form.name}
          required
          sx={{mt: '16px', minWidth: 350}}
          onChange={e => form.name = e.target.value}
          error={!!errors.name}
          helperText={errors.name}
          onBlur={() => {
            if (form.name === '') {
              setErrors(errors => ({...errors, name: 'This field cannot be empty'}));
            } else {
              setErrors(errors => ({...errors, name: ''}));
            }
          }}
        />

        <GeneralField
          key={'uri'}
          label={'URI'}
          value={form.uri}
          sx={{mt: '16px', minWidth: 350}}
          onChange={e => form.uri = e.target.value}
          error={!!errors.uri}
          helperText={errors.uri}
          onBlur={() => {
            if (form.uri !== '' && !isValidURL(form.uri)) {
              setErrors(errors => ({...errors, uri: 'Please input an valid URI'}));
            } else {
              setErrors(errors => ({...errors, uri: ''}));
            }

          }}
        />

        <SelectField
          key={'organization'}
          label={'Organization'}
          value={form.organization}
          options={ops.organization}
          error={!!errors.organization}
          helperText={
            errors.organization
          }
          onChange={e => {
            setForm(form => ({
                ...form, organization: e.target.value
              })
            );
          }}
        />
        <GeneralField
          key={'description'}
          label={'Description'}
          value={form.description}
          sx={{mt: '16px', minWidth: 350}}
          onChange={e => form.description = e.target.value}
          error={!!errors.description}
          helperText={errors.description}
          minRows={4}
          multiline
        />

        <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmit}>
          Submit
        </Button>


        <AlertDialog dialogContentText={"You won't be able to edit the information after clicking CONFIRM."}
                     dialogTitle={mode === 'new' ? 'Are you sure you want to create this new Impact Model?' :
                       'Are you sure you want to update this Impact Model?'}
                     buttons={[<Button onClick={() => setState(state => ({...state, submitDialog: false}))}
                                       key={'cancel'}>{'cancel'}</Button>,
                       <LoadingButton noDefaultStyle variant="text" color="primary" loading={state.loadingButton}
                                      key={'confirm'}
                                      onClick={handleConfirm} children="confirm" autoFocus/>]}
                     open={state.submitDialog}/>
      </Paper>)}

    </Container>);

}