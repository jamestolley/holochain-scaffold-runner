<script lang="ts">
import { createEventDispatcher, onMount, getContext } from 'svelte';
import '@material/mwc-circular-progress';
import { decode } from '@msgpack/msgpack';
import type { Record, ActionHash, AppAgentClient, EntryHash, AgentPubKey, DnaHash } from '@holochain/client';
import { clientContext } from '../../contexts';
import type { Comment } from './types';
import '@material/mwc-circular-progress';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-snackbar';
import '@material/mwc-icon-button';

const dispatch = createEventDispatcher();

export let commentHash: ActionHash;

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

let loading = true;
let error: any = undefined;

let record: Record | undefined;
let comment: Comment | undefined;


let errorSnackbar: Snackbar;
  
$:  error, loading, record, comment;

onMount(async () => {
  if (commentHash === undefined) {
    throw new Error(`The commentHash input is required for the CommentDetail element`);
  }
  await fetchComment();
});

async function fetchComment() {
  loading = true;
  error = undefined;
  record = undefined;
  comment = undefined;
  
  try {
    record = await client.callZome({
      cap_secret: null,
      role_name: 'forum',
      zome_name: 'posts',
      fn_name: 'get_comment',
      payload: commentHash,
    });
    if (record) {
      comment = decode((record.entry as any).Present.entry) as Comment;
    }
  } catch (e) {
    error = e;
  }

  loading = false;
}

async function deleteComment() {
  try {
    await client.callZome({
      cap_secret: null,
      role_name: 'forum',
      zome_name: 'posts',
      fn_name: 'delete_comment',
      payload: commentHash,
    });
    dispatch('comment-deleted', { commentHash: commentHash });
  } catch (e: any) {
    errorSnackbar.labelText = `Error deleting the comment: ${e.data.data}`;
    errorSnackbar.show();
  }
}
</script>

<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>

{#if loading}
<div style="display: flex; flex: 1; align-items: center; justify-content: center">
  <mwc-circular-progress indeterminate></mwc-circular-progress>
</div>
{:else if error}
<span>Error fetching the comment: {error.data.data}</span>
{:else}

<div style="display: flex; flex-direction: column">
  <div style="display: flex; flex-direction: row">
    <span style="flex: 1"></span>
    <mwc-icon-button style="margin-left: 8px" icon="delete" on:click={() => deleteComment()}></mwc-icon-button>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Comment Content:</strong></span>
    <span style="white-space: pre-line">{ comment.comment_content }</span>
  </div>

</div>
{/if}

