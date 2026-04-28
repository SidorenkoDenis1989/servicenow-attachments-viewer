// service/attachments.service.js
import { graphqlQuery } from './graphql.service';
import authService from './auth.service';

export const ATTACHMENT_TYPES = {
    video: 'video',
    image: 'image',
    text:  'text',
    audio: 'audio'
};

// ─── Queries & Mutations ────────────────────────────────────────────────────

const ATTACHMENTS_QUERY = `
    query nowRecordCommonAttachmentsConnected(
        $table: String!
        $sysId: String!
        $fetchDocument: Boolean!
    ) {
        query: GlideAttachmentQuery_Query {
            model: attachments(table: $table sysId: $sysId fetchDocument: $fetchDocument) {
                attachments: records {
                    name
                    document { name documentSysId canRemoveRef canDelete canEditName }
                    userId userName date dateLabel type state size sysId
                    canEditName canDelete isEncrypted
                }
                count types docViewerEnabled extensions
                canCreate fileNameLength
            }
        }
    }
`;

const SORT_PREFERENCE_QUERY = `
    query nowRecordCommonAttachmentsConnected($name: String!) {
        glide: GlideLayoutDomain_Query {
            user {
                preferences(name: [$name]) { name value }
            }
        }
    }
`;

const SET_SORT_PREFERENCE_MUTATION = `
    mutation nowRecordCommonAttachmentsConnected($name: String! $value: String!) {
        GlideLayoutDomain_Mutation {
            user {
                setPreference(name: $name value: $value) { name value }
            }
        }
    }
`;

const DELETE_ATTACHMENT_MUTATION = `
    mutation nowRecordCommonAttachmentsConnected($sys_id: String!) {
        GlideRecord_Mutation {
            delete_sys_attachment(sys_id: $sys_id) { modified_count }
        }
    }
`;

const RENAME_ATTACHMENT_MUTATION = `
    mutation nowRecordCommonAttachmentsConnected($sys_id: String! $file_name: String!) {
        GlideRecord_Mutation {
            update_sys_attachment(sys_id: $sys_id file_name: $file_name) {
                file_name { value }
            }
        }
    }
`;

// ─── Service Class ──────────────────────────────────────────────────────────

class AttachmentsService {

    #mapAttachment(att) {
        return {
            sys_id:         att.sysId,
            file_name:      att.name,
            content_type:   att.type,
            size_bytes:     att.size,
            sys_created_on: att.date,
            download_link:  `/sys_attachment.do?sys_id=${att.sysId}`,
            can_delete:     att.canDelete,
            can_edit_name:  att.canEditName,
            ...att
        };
    }

    #buildOperation(query, variables) {
        return {
            operationName: 'nowRecordCommonAttachmentsConnected',
            query,
            variables,
            cacheable:  false,
            extensions: {}
        };
    }

    isVideo(att)       { return att?.content_type?.includes(ATTACHMENT_TYPES.video); }
    isImage(att)       { return att?.content_type?.includes(ATTACHMENT_TYPES.image); }
    isText(att)        { return att?.content_type?.includes(ATTACHMENT_TYPES.text);  }
    isAudio(att)       { return att?.content_type?.includes(ATTACHMENT_TYPES.audio); }
    isPreviewable(att) { return this.isText(att) || this.isImage(att) || this.isVideo(att) || this.isAudio(att); }

    download(attachment) {
        window.location.href = attachment.download_link;
    }

    sort(sortDirection, a, b) {
        const nameA = a.file_name.toLowerCase();
        const nameB = b.file_name.toLowerCase();
        if (nameA < nameB) return sortDirection === 'ascending' ? -1 : 1;
        if (nameA > nameB) return sortDirection === 'ascending' ? 1 : -1;
        return 0;
    }

    async fetch(table, sysId) {
        const results = await graphqlQuery([
            this.#buildOperation(SORT_PREFERENCE_QUERY, {
                name: `workspace.attachment_sort_direction.${table}`
            }),
            this.#buildOperation(ATTACHMENTS_QUERY, {
                table, sysId, fetchDocument: false
            })
        ]);

        const sortDirection = results[0]?.data?.glide?.user?.preferences?.[0]?.value ?? 'ascending';
        const records       = results[1]?.data?.query?.model?.attachments ?? [];

        return {
            attachments:  records.map(att => this.#mapAttachment(att)),
            sortDirection
        };
    }

    async updateSortPreference(table, sortDirection) {
        const result = await graphqlQuery(
            this.#buildOperation(SET_SORT_PREFERENCE_MUTATION, {
                name:  `workspace.attachment_sort_direction.${table}`,
                value: sortDirection
            })
        );

        return result?.data?.GlideLayoutDomain_Mutation?.user?.setPreference;
    }

    async upload(table, sysId, file) {
        const formData = new FormData();
        formData.append('sysparm_table',        table);
        formData.append('sysparm_sys_id',       sysId);
        formData.append('sysparm_nostack',      'yes');
        formData.append('attachments_modified', 'true');
        formData.append('file',                 file, file.name);

        const url = `/angular.do?sysparm_type=ngk_attachments&sysparm_verbose_session_message=false&action=add&table=${encodeURIComponent(table)}&sys_id=${encodeURIComponent(sysId)}&load_attachment_record=true`;

        const res = await fetch(url, {
            method:      'POST',
            credentials: 'same-origin',
            headers:     { 'X-UserToken': authService.token },
            body:        formData
        });

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

        const json = await res.json();
        const att  = json?.attachments?.[0] ?? json;

        return this.#mapAttachment({
            ...att,
            sysId:       att.sys_id,
            name:        att.file_name,
            type:        att.content_type,
            size:        att.size_bytes,
            date:        att.sys_created_on,
            canDelete:   true,
            canEditName: true,
        });
    }

    async delete(sysId) {
        const json = await graphqlQuery(
            this.#buildOperation(DELETE_ATTACHMENT_MUTATION, { sys_id: sysId })
        );

        const modifiedCount = json?.data?.GlideRecord_Mutation?.delete_sys_attachment?.modified_count;
        if (!modifiedCount || modifiedCount < 1) throw new Error('Delete returned modified_count 0');

        return modifiedCount;
    }

    async rename(sysId, newFileName) {
        const json = await graphqlQuery(
            this.#buildOperation(RENAME_ATTACHMENT_MUTATION, {
                sys_id:    sysId,
                file_name: newFileName
            })
        );

        const updatedFileName = json?.data?.GlideRecord_Mutation?.update_sys_attachment?.file_name;
        if (!updatedFileName) throw new Error('No attachments were renamed');

        return updatedFileName;
    }
}

export default new AttachmentsService();
