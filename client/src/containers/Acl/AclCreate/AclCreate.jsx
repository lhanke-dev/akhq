import React from 'react';
import Joi from 'joi-browser';
import { withRouter } from 'react-router-dom';
import Form from '../../../components/Form/Form';
import Header from '../../Header';
import { uriAclsCreate } from '../../../utils/endpoints';
import { toast } from 'react-toastify';

class AclCreate extends Form {

  state = {
    formData: {
      principal: '',
        host: '',
        operation: '',
          operationPermissionType: '',
          resourceType: '',
          resourceName: '',
          resourcePatternType: '',
          ...(this.props.location.state && (this.props.location.state.formData ?? {}))
    },
    errors: {}
  };

  schema = {
    principal: Joi.string()
      .required()
      .label('Principal'),
    host: Joi.string()
      .required()
      .label('Host'),
    operation: Joi.string()
    .required()
    .label('Operation'),
    operationPermissionType: Joi.string()
    .required()
    .label('Premission Type'),
    resourceType: Joi.string()
    .required()
    .label('Resource Type'),
    resourceName: Joi.string()
      .required()
      .label('Resource Name'),
    resourcePatternType:  Joi.string()
      .required()
      .label('Resource Pattern Type')
  };

  async doSubmit() {
    const { formData } = this.state;
    const { clusterId } = this.props.match.params;
    const principal = formData.principal;
    const acl = {
      host: formData.host,
      operation: {
        operation: formData.operation,
        permissionType: formData.operationPermissionType
      },
      resource: {
        resourceType: formData.resourceType,
        name: formData.resourceName,
        patternType: formData.resourcePatternType
      }
    };

    this.postApi(uriAclsCreate(clusterId, principal), acl)
      .then(() => {
        this.props.history.goBack()
        toast.success(`Acl '${acl.operation.permissionType} ${acl.operation.operation} on ${acl.resource.resourceType} ${acl.resource.name} by ${principal}' was created`);
      });
  }

  render() {
    return (
      <div>   
        <form
          encType="multipart/form-data"
          className="aclCreate khq-form khq-form-config"
          onSubmit={() => this.doSubmit()}
        >
          <Header title="Create an ACL" history={this.props.history} />
          {this.renderInput('principal', 'Principal', 'Principal')}
          {this.renderInput('host', 'Host', 'Host')}
          {this.renderInput('operation', 'Operation', 'Operation')}
          {this.renderInput('operationPermissionType', 'Operation Permission Type', 'Operation Permission Type')}
          {this.renderInput('resourceType', 'Resource Type', 'Resource Type')}
          {this.renderInput('resourceName', 'Resource Name', 'Resource Name')}
          {this.renderInput('resourcePatternType', 'Resource Pattern Type', 'Resource Pattern Type')}
          
          {this.renderButton(
            'Create',
            () => {
              this.doSubmit();
            },
            undefined,
            'button'
          )}
        </form>
      </div>
    );
  }
}

export default withRouter(AclCreate);
