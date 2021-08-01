import React from 'react';
import Header from '../../Header';
import {Link} from 'react-router-dom';
import Table from '../../../components/Table';
import * as constants from '../../../utils/constants';
import { uriAclsDelete, uriAclsList } from '../../../utils/endpoints';
import SearchBar from '../../../components/SearchBar';
import Root from "../../../components/Root";
import {toast} from 'react-toastify';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import AclDeleteModal from './AclDeleteModal';

class Acls extends Root {
  state = {
    data: [],
    selectedCluster: '',
    searchData: {
      search: ''
    },
    loading: true,

    // deletion
    principalToDeleteAclFor: undefined,
    aclsToDelete: undefined,
    showDeleteModal: false,
  };

  componentDidMount() {
    const { searchData } = this.state;
    const query =  new URLSearchParams(this.props.location.search);
    const { clusterId } = this.props.match.params;

    this.setState({ selectedCluster: clusterId, searchData: { search: (query.get('search'))? query.get('search') : searchData.search }}, () => {
      this.getAcls();
    });
  }

  async getAcls() {
    let acls = [];
    const { selectedCluster } = this.state;

    acls = await this.getApi(uriAclsList(selectedCluster, this.state.searchData.search));
    this.handleData(acls.data);
  }

  handleData(acls) {
    let tableAcls = acls.map(acl => {
      acl.principalEncoded = btoa(acl.principal);
      return {
        id: acl,
        user: acl.principal || ''
      };
    });
    this.setState({ data: tableAcls, loading: false });
    return tableAcls;
  }

  handleSearch = data => {
    const { searchData } = data;
    this.setState({ searchData, loading: true }, () => {
      this.getAcls();
      this.props.history.push({
        pathname: `/ui/${this.state.selectedCluster}/acls`,
        search: `search=${searchData.search}`
      });
    });
  };

  render() {
    const { data, searchData, loading } = this.state;
    const { clusterId } = this.props.match.params;
    const roles = this.state.roles || {};

    const actions = [constants.TABLE_DETAILS];
    //if(roles.acls && roles.acls['acls/delete']) {
      actions.push(constants.TABLE_DELETE);
    //}

    return (
      <div>
        <Header title="Acls" history={this.props.history} />
        <nav
          className="navbar navbar-expand-lg navbar-light bg-light mr-auto
         khq-data-filter khq-sticky khq-nav"
        >
          <SearchBar
            showSearch={true}
            search={searchData.search}
            showPagination={false}
            showTopicListView={false}
            showConsumerGroup
            groupListView={'ALL'}
            doSubmit={this.handleSearch}
          />
        </nav>
        <Table
          loading={loading}
          history={this.props.history}
          columns={[
            {
              id: 'user',
              accessor: 'user',
              colName: 'Principals',
              type: 'text',
              sortable: true
            }
          ]}
          actions={actions}
          data={data}
          updateData={data => {
            this.setState({ data });
          }}
          onDelete={acl => this.setState({showDeleteModal: true, principalToDeleteAclFor: acl.id.principal, aclsToDelete: acl.id.acls })}
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
          onDetails={acl => `/ui/${clusterId}/acls/${acl.principalEncoded}`}
        />
        {/*roles.acls && roles.acls['acls/insert'] && */(
          <aside>
            <Link
              to={{
                pathname: `/ui/${clusterId}/acls/create`
              }}
              className="btn btn-primary"
            >
              Create ACL
            </Link>
          </aside>
        )}
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

export default Acls;
