const {GDBUserAccountModel} = require("../../models/userAccount");
const {GDBIndicatorModel} = require("../../models/indicator");
const {allReachableOrganizations, addObjectToList} = require("../../helpers");
const {GDBOrganizationModel} = require("../../models/organization");
const {Server400Error} = require("../../utils");
const {hasAccess} = require("../../helpers/hasAccess");
const {GDBImpactModelModel} = require("../../models/impactStuffs");

const fetchImpactModels = async (req, res) => {

  const userAccount = await GDBUserAccountModel.findOne({_uri: req.session._uri});
  const {organizationUri} = req.params;
  if (!organizationUri || organizationUri === 'all') {
    // the organizationId is not given, return all indicators which is reachable by the user

    if (userAccount.isSuperuser) {
      // simple return all indicators to him
      const impactModels = await GDBImpactModelModel.find();
      impactModels.map(impactModel => impactModel.editable = true);
      return res.status(200).json({success: true, impactModels});
    }
    // take all reachable organizations
    const reachableOrganizations = await allReachableOrganizations(userAccount);
    const indicatorURIs = [];
    // fetch all available indicatorURIs from reachableOrganizations
    const editableIndicatorURIs = [];
    reachableOrganizations.map(organization => {
      if (organization.hasIndicators)
        organization.hasIndicators.map(indicatorURI => {
          if (addObjectToList(indicatorURIs, indicatorURI)) {
            // if the indicator is actually added
            if (organization.editors.includes(userAccount._uri)) {
              // and if the userAccount is one of the editor of the organization
              // the indicator will be marked
              editableIndicatorURIs.push(indicatorURI);
            }
          }
        });
    });
    // replace indicatorURIs to actual indicator objects
    const indicators = await Promise.all(indicatorURIs.map(indicatorURI => {
      return GDBIndicatorModel.findOne({_uri: indicatorURI}, {populates: ['unitOfMeasure', 'baseline']});
    }));
    // for all indicators, if its id in editableIndicatorIDs, then it is editable
    indicators.map(indicator => {
      if (editableIndicatorURIs.includes(indicator._uri))
        indicator.editable = true;
    });
    return res.status(200).json({success: true, indicators});
  } else {
    // the organizationUri is given, return all indicators belongs to the organization
    const organization = await GDBOrganizationModel.findOne({_uri: organizationUri},
      {populates: ['impactModels']}
    );
    if (!organization)
      throw new Server400Error('No such organization');
    if (!organization.impactModels)
      return res.status(200).json({success: true, indicators: []});
    let editable;
    if (userAccount.isSuperuser || organization.editors?.includes(userAccount._uri)) {
      editable = true;
      organization.impactModels.map(indicator => {
        indicator.editable = true;
      });
    }
    return res.status(200).json({success: true, impactModels: organization.impactModels, editable});
  }


};

const fetchImpactModelsHandler = async (req, res, next) => {
  try {
    if (await hasAccess(req, 'fetchImpactModels'))
      return await fetchImpactModels(req, res);
    return res.status(400).json({success: false, message: 'Wrong auth'});

  } catch (e) {
    next(e);
  }
};


const fetchImpactModelInterfacesHandler = async (req, res, next) => {
  try {
    if (await hasAccess(req, 'fetchImpactModelInterfaces'))
      return await fetchImpactModelInterfaces(req, res);
    return res.status(400).json({success: false, message: 'Wrong auth'});

  } catch (e) {
    next(e);
  }
};

const fetchImpactModelInterfaces = async (req, res) => {
  const {organizationUri} = req.params;
  let impactModels
  if (organizationUri === 'undefined' || !organizationUri) {
    impactModels = await GDBImpactModelModel.find({});
  } else {
    impactModels = await GDBImpactModelModel.find({organization: organizationUri})
  }

  const impactModelInterfaces = {};
  impactModels.map(impact => {
    impactModelInterfaces[impact._uri] = impact.name || impact._uri;
  });
  return res.status(200).json({success: true, impactModelInterfaces});

}


module.exports = {
  fetchImpactModelsHandler,
  fetchImpactModelInterfacesHandler
}