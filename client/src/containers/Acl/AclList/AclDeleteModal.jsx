import React from 'react';
import { uriAclsDelete } from '../../../utils/endpoints';
import {toast} from 'react-toastify';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { remove } from '../../../utils/api';

export default function AclDeleteModal({cluster, principal, acls = [], isShown, closeModal}) {
    
    const aclAsString = acl => `${acl.operation.permissionType} ${acl.operation.operation} on ${acl.resource.resourceType} ${acl.resource.name} by ${principal}`;

      const deleteAcls = () => {
        Promise.all(
          acls.map(acl => remove(uriAclsDelete(cluster, principal), acl))
        )
          .then(() => {
            const msg = acls.length > 1 ? `${acls.length} acls deleted.` : `Deleted '${aclAsString(acls[0])}'.`
            toast.success(msg);
            closeModal();
          })
          .catch(closeModal);
      };

      return (
        <ConfirmModal
            show={isShown}
            handleCancel={closeModal}
            handleConfirm={deleteAcls}
            message={
                <React.Fragment>Do you want to delete acl: <div>{acls.map(acl => <div><code>{aclAsString(acl)}</code></div>)}</div>?</React.Fragment>
            }
        />
    );

}