import React from 'react';
import Table from '../../../../components/Table';
import {Link} from 'react-router-dom';
import { uriTopicsAcls } from '../../../../utils/endpoints';
import Root from "../../../../components/Root";
import * as constants from '../../../../utils/constants';
import AclDeleteModal from '../../../Acl/AclList/AclDeleteModal';

class TopicAcls extends Root {
  state = {
    data: [],
    selectedCluster: this.props.clusterId,
    loading: true,

    // deletion
    principalToDeleteAclFor: undefined,
    aclsToDelete: undefined,
    showDeleteModal: false,
  };

  componentDidMount() {
    this.getAcls();
  }

  async getAcls() {
    let acls = [];
    const { clusterId, topicId } = this.props;

    acls = await this.getApi(uriTopicsAcls(clusterId, topicId));
    this.handleData(acls.data);
  }

  handleData(data) {
    let tableAcls = [];
    data.map(principal =>
      principal.acls.forEach((acl, index) => {
        tableAcls.push({
          id: index,
          principal: principal.principal,
          topic: acl.resource.name || '',
          host: acl.host || '',
          permission: acl.operation || '',
          origin: acl
        });
      })
    );
    this.setState({ data: tableAcls, loading: false });
    return tableAcls;
  }

  render() {
    const { data, loading } = this.state;
    const actions = [];
    //if(roles.acls && roles.acls['acls/delete']) {
      actions.push(constants.TABLE_DELETE);
    //}
    return (
      <div>
        <Table
          actions={actions}
          loading={loading}
          history={this.props.history}
          columns={[
            {
              id: 'principal',
              accessor: 'principal',
              colName: 'Principal',
              type: 'text',
              sortable: true
            },
            {
              id: 'host',
              accessor: 'host',
              colName: 'Host',
              type: 'text',
              sortable: true
            },
            {
              id: 'permission',
              accessor: 'permission',
              colName: 'Permissions',
              type: 'text',
              cell: (obj, col) => {
                return (
                  <React.Fragment>
                    <span className="badge badge-secondary">
                      {obj[col.accessor].permissionType}
                    </span>{' '}
                    {obj[col.accessor].operation}
                  </React.Fragment>
                );
              }
            }
          ]}
          data={data}
          updateData={data => {
            this.setState({ data });
          }}
          onDelete={tableEntry => this.setState({showDeleteModal: true, principalToDeleteAclFor: tableEntry.principal, aclsToDelete: [tableEntry.origin] })}
          noContent={
            <tr>
              <td colSpan={3}>
                <div className="alert alert-warning mb-0" role="alert">
                  No ACLS found, or the "authorizer.class.name" parameter is not configured on the
                  cluster.
                </div>
              </td>
            </tr>
          }
        />
        <AclDeleteModal
          cluster={this.state.selectedCluster}
          principal={this.state.principalToDeleteAclFor}
          acls={this.state.aclsToDelete}
          isShown={this.state.showDeleteModal}
          closeModal={() => this.setState({showDeleteModal: false}, () => this.getAcls())}
        />
      </div>
    );
  }
}

export default TopicAcls;
