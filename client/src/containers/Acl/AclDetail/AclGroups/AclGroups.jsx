import React from 'react';
import Table from '../../../../components/Table/Table';
import { uriAclsByPrincipal } from '../../../../utils/endpoints';
import Root from "../../../../components/Root";
import * as constants from '../../../../utils/constants';
import AclDeleteModal from "../../AclList/AclDeleteModal";

class AclTopics extends Root {
  state = {
    selectedCluster: this.props.clusterId,
    principalEncoded: this.props.principalEncoded,
    tableData: [],
    loading: true,

     // deletion
    aclToDelete: undefined,
    showDeleteModal: false
  };

  componentDidMount() {
    this.getAcls();
  }

  async getAcls() {
    const { selectedCluster, principalEncoded } = this.state;

    const response = await this.getApi(uriAclsByPrincipal(selectedCluster, principalEncoded, 'GROUP'));
    if (response.data.acls) {
      const acls = response.data || [];
      this.handleAcls(acls);
    } else {
      this.setState({ tableData: [], loading: false });
    }
  }

  handleAcls = data => {
    const tableData = data.acls.map(acl => {
      return {
        group: acl.resource.name,
        host: acl.host,
        permission: acl.operation,
        origin: acl
      };
    });

    this.setState({ tableData, loading: false });
  };

  handlePermission = permission => {
    return (
      <React.Fragment>
        <span className="badge badge-secondary">{permission.permissionType}</span>{' '}
        {permission.operation}
      </React.Fragment>
    );
  };

  render() {
    const { loading } = this.state;
    const actions = /*roles.acls && roles.acls['acls/delete']*/ true ? [constants.TABLE_DELETE] : [];
    return (
      <div>
      <Table
        actions={actions}
        loading={loading}
        history={this.props.history}
        columns={[
          {
            id: 'group',
            accessor: 'group',
            colName: 'Group',
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
            colName: 'Permission',
            type: 'text',
            cell: obj => {
              if (obj.permission) {
                return <div>{this.handlePermission(obj.permission)}</div>;
              }
            }
          }
        ]}
        data={this.state.tableData}
        updateData={data => {
          this.setState({ tableData: data });
        }}
        onDelete={row => this.setState({showDeleteModal: true, aclToDelete: row.origin })}
        noContent={
          'No ACLS found, or the "authorizer.class.name" parameter is not configured on the cluster.'
        }
      />
      <AclDeleteModal
          cluster={this.state.selectedCluster}
          principal={atob(this.state.principalEncoded)}
          acls={this.state.aclToDelete ? [this.state.aclToDelete] : []}
          isShown={this.state.showDeleteModal}
          closeModal={() => this.setState({showDeleteModal: false}, () => this.getAcls())}
        />
      </div>
    );
  }
}

export default AclTopics;
