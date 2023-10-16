<script lang="ts">
import { createEventDispatcher, onMount, getContext } from 'svelte';
import '@material/mwc-circular-progress';
import { decode } from '@msgpack/msgpack';
import type { Record, ActionHash, AppAgentClient, EntryHash, AgentPubKey, DnaHash } from '@holochain/client';
import { clientContext } from '../../contexts';
import type { Post } from './types';
import '@material/mwc-circular-progress';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-snackbar';
import '@material/mwc-icon-button';
import EditPost from './EditPost.svelte'; 

const dispatch = createEventDispatcher();

export let postHash: ActionHash;

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

let loading = true;
let error: any = undefined;

let record: Record | undefined;
let post: Post | undefined;

let editing = false;

  
$: editing,  error, loading, record, post;

onMount(async () => {
  if (postHash === undefined) {
    throw new Error(`The postHash input is required for the PostDetail element`);
  }
  await fetchPost();
});

async function fetchPost() {
  loading = true;
  error = undefined;
  record = undefined;
  post = undefined;
  
  try {
    record = await client.callZome({
      cap_secret: null,
      role_name: 'forum',
      zome_name: 'posts',
      fn_name: 'get_post',
      payload: postHash,
    });
    if (record) {
      post = decode((record.entry as any).Present.entry) as Post;
    }
  } catch (e) {
    error = e;
  }

  loading = false;
}

</script>


{#if loading}
<div style="display: flex; flex: 1; align-items: center; justify-content: center">
  <mwc-circular-progress indeterminate></mwc-circular-progress>
</div>
{:else if error}
<span>Error fetching the post: {error.data.data}</span>
{:else if editing}
<EditPost
  originalPostHash={ postHash}
  currentRecord={record}
  on:post-updated={async () => {
    editing = false;
    await fetchPost()
  } }
  on:edit-canceled={() => { editing = false; } }
></EditPost>
{:else}

<div style="display: flex; flex-direction: column">
  <div style="display: flex; flex-direction: row">
    <span style="flex: 1"></span>
    <mwc-icon-button style="margin-left: 8px" icon="edit" on:click={() => { editing = true; } }></mwc-icon-button>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Title:</strong></span>
    <span style="white-space: pre-line">{ post.title }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Content:</strong></span>
    <span style="white-space: pre-line">{ post.content }</span>
  </div>

</div>
{/if}

