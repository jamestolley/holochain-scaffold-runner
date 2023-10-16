<script lang="ts">
import { createEventDispatcher, getContext, onMount } from 'svelte';
import type { AppAgentClient, Record, EntryHash, AgentPubKey, ActionHash, DnaHash } from '@holochain/client';
import { clientContext } from '../../contexts';
import type { Post } from './types';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-textarea';
import '@material/mwc-textfield';

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

const dispatch = createEventDispatcher();


let title: string = '';
let content: string = '';

let errorSnackbar: Snackbar;

$: title, content;
$: isPostValid = true && title !== '' && content !== '';

onMount(() => {
});

async function createPost() {  
  const postEntry: Post = { 
    title: title!,
    content: content!,
  };
  
  try {
    const record: Record = await client.callZome({
      cap_secret: null,
      role_name: 'forum',
      zome_name: 'posts',
      fn_name: 'create_post',
      payload: postEntry,
    });
    dispatch('post-created', { postHash: record.signed_action.hashed.hash });
  } catch (e) {
    errorSnackbar.labelText = `Error creating the post: ${e.data.data}`;
    errorSnackbar.show();
  }
}

</script>
<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Create Post</span>
  

  <div style="margin-bottom: 16px">
    <mwc-textfield outlined label="Title" value={ title } on:input={e => { title = e.target.value; } } required></mwc-textfield>          
  </div>
            
  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Content" value={ content } on:input={e => { content = e.target.value;} } required></mwc-textarea>          
  </div>
            

  <mwc-button 
    raised
    label="Create Post"
    disabled={!isPostValid}
    on:click={() => createPost()}
  ></mwc-button>
</div>
