import React, {useEffect, useState, useContext} from 'react';
import {Container, Paper, Table, TableContainer, Typography} from "@mui/material";

import {DropdownMenu, Link, Loading, DataTable} from "../shared";
import {useNavigate, useParams} from "react-router-dom";
import {useSnackbar} from 'notistack';
import {UserContext} from "../../context";
import {reportErrorToBackend} from "../../api/errorReportApi";
import {navigateHelper} from "../../helpers/navigatorHelper";
import {fetchStakeholderOutcomesThroughOrganization} from "../../api/stakeholderOutcomeAPI";
import {EnhancedTableToolbar} from "../shared/Table/EnhancedTableToolbar";
import {fetchDataType} from "../../api/generalAPI";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";


export default function StakeholderOutcomeView({
                                                 multi,
                                                 single,
                                                 organizationUser,
                                                 superUser,
                                                 groupUser,
                                                 organizationUri
                                               }) {
  const {enqueueSnackbar} = useSnackbar();
  const {uri} = useParams();
  const navigator = useNavigate();
  const navigate = navigateHelper(navigator);
  const userContext = useContext(UserContext);
  const [state, setState] = useState({
    loading: true,
    data: [],
    selectedUri: null,
    deleteDialogTitle: '',
    showDeleteDialog: false,
    editable: false
  });
  const [trigger, setTrigger] = useState(true);

  useEffect(() => {
    if (multi) {
      fetchStakeholderOutcomesThroughOrganization(encodeURIComponent(organizationUri)).then(res => {
        if (res.success)
          setState(state => ({...state, loading: false, data: res.stakeholderOutcomes, editable: res.editable}));
        console.log(res.stakeholderOutcomes);
      }).catch(e => {
        reportErrorToBackend(e);
        setState(state => ({...state, loading: false}));
        console.log(e);
        enqueueSnackbar(e.json?.message || "Error occur", {variant: 'error'});
      });
    } else if (single) {
      fetchDataType('stakeholderOutcome', encodeURIComponent(uri)).then(({success, stakeholderOutcome, editable}) => {
        if (success) {
          setState(state => ({...state, loading: false, data: [stakeholderOutcome], editable: editable}));
        }
      }).catch(e => {
        reportErrorToBackend(e);
        setState(state => ({...state, loading: false}));
        console.log(e);
        enqueueSnackbar(e.json?.message || "Error occur", {variant: 'error'});
      });
    }
  }, [trigger]);

  // const showDeleteDialog = (id) => {
  //   setState(state => ({
  //     ...state, selectedId: id, showDeleteDialog: true,
  //     deleteDialogTitle: 'Delete organization ' + id + ' ?'
  //   }));
  // };

  // const handleDelete = async (id, form) => {
  //
  //   deleteOrganization(id).then(({success, message})=>{
  //     if (success) {
  //       setState(state => ({
  //         ...state, showDeleteDialog: false,
  //       }));
  //       setTrigger(!trigger);
  //       enqueueSnackbar(message || "Success", {variant: 'success'})
  //     }
  //   }).catch((e)=>{
  //     setState(state => ({
  //       ...state, showDeleteDialog: false,
  //     }));
  //     setTrigger(!trigger);
  //     enqueueSnackbar(e.json?.message || "Error occur", {variant: 'error'});
  //   });
  //
  // };

  const columns = [
    {
      label: 'Stakeholder',
      body: ({stakeholder}) => {
        return <Link colorWithHover to={`/stakeholder/${encodeURIComponent(stakeholder)}/view`}>
          {stakeholder}
        </Link>;
      },
    },
    {
      label: 'outcome',
      body: ({outcome}) => {
        return <Link colorWithHover to={`/outcome/${encodeURIComponent(outcome)}/view`}>
          {outcome}
        </Link>;
      }
    },
    {
      label: 'Indicator(s)',
      body: ({indicators}) => {
        return indicators?.map(indicator =>
          <Link colorWithHover to={`/indicator/${encodeURIComponent(indicator)}/view`}>
            {indicator}
          </Link>
        );
      }
    },
    {
      label: 'Stakeholder Outcome Code(s)',
      body: ({codes}) => {
        return codes?.map(code =>
          <Link colorWithHover to={`/code/${encodeURIComponent(code)}/view`}>
            {code}
          </Link>
        )
          ;
      }
    },


    {
      label: ' ',
      body: ({_uri}) =>
        <DropdownMenu urlPrefix={'stakeholderOutcome'} objectUri={encodeURIComponent(_uri)}
                      hideEditOption={!state.editable} hideDeleteOption
                      handleDelete={() => showDeleteDialog(_uri)}/>
    }
  ];

  if (state.loading)
    return <Loading message={`Loading Stakeholder Outcomes...`}/>;

  const style = {backgroundColor: 'rgb(39, 44, 52)', color: 'white', width: '12rem'}


  return (
      <Container>
        <Typography variant={'h2'}> Stakeholder Outcomes </Typography>
        <br/>
        {
          state.data.map(stakeholderOutcome => {
            return (
                <Container>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableRow>
                        <TableCell sx={style} variant="head">Stakeholder Outcome Name</TableCell>
                        <TableCell>{stakeholderOutcome.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={style} variant="head">Stakeholder Outcome
                          URI</TableCell>
                        <TableCell sx={{display: 'flex', justifyContent: 'space-between'}}>
                          <Link
                              colorWithHover
                              to={`/stakeholderOutcome/${encodeURIComponent(stakeholderOutcome._uri)}/view`}
                          >{stakeholderOutcome._uri}

                          </Link>
                          <DropdownMenu urlPrefix={'stakeholderOutcome'}
                                        objectUri={encodeURIComponent(stakeholderOutcome._uri)} hideDeleteOption
                                        hideEditOption={!userContext.isSuperuser}
                                        handleDelete={() => showDeleteDialog(stakeholderOutcome._uri)}/>

                        </TableCell>

                      </TableRow>
                      <TableRow>
                        <TableCell sx={style} variant="head">
                          Description</TableCell>
                        <TableCell>{stakeholderOutcome.description}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={style} variant="head">Underserved</TableCell>
                        <TableCell>{stakeholderOutcome.isUnderserved}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={style} variant="head">Impact Report</TableCell>
                        <TableCell> {stakeholderOutcome.impactReports.map(impactReportUri => {
                          return (
                              <>
                                <Link
                                    colorWithHover
                                    to={`/impactReport/${encodeURIComponent(impactReportUri)}/view`}
                                >
                                  {impactReportUri}
                                </Link>
                                <br/>
                              </>
                          )
                        })}</TableCell>
                      </TableRow>
                    </Table>
                  </TableContainer>

                  <DataTable
                      noHeaderBar
                      noPaginationBar
                      title={''}
                      data={[stakeholderOutcome]}
                      columns={columns}
                      uriField="uri"
                  />
                  <br/>
                  <br/>
                </Container>

            );
          })

        }
      </Container>
  );
}