import {reserveExample,matchingTrio} from '../lib/exploration.mjs';
const lab=document.querySelector<HTMLElement>('[data-lab]');
if(lab){
 const pt=lab.dataset.lang==='pt',status=lab.querySelector<HTMLElement>('.lab-status');
 if(lab.dataset.lab==='lastro'){
  let state={stock:3,reserved:false,replayed:false};
  lab.querySelectorAll<HTMLButtonElement>('[data-tx]').forEach(button=>button.addEventListener('click',()=>{
   if(button.dataset.tx==='reset'){state={stock:3,reserved:false,replayed:false};status!.textContent=pt?'Estado inicial restaurado.':'Initial state restored.';}
   else{state=reserveExample(state);status!.textContent=state.replayed?(pt?'Resposta reutilizada. A mesma chave não reduz o estoque novamente.':'Response replayed. The same key does not reduce stock again.'):(pt?'Reserva criada. Estoque reduzido uma única vez.':'Reservation created. Stock reduced once.');}
   lab.querySelector('[data-stock]')!.textContent=String(state.stock);
  }));
 }
 lab.querySelectorAll<HTMLButtonElement>('.lab-task').forEach(task=>{const name=task.firstChild!.textContent;task.addEventListener('click',()=>{const step=(Number(task.dataset.step)+1)%3;task.dataset.step=String(step);lab.querySelector(`[data-lane="${step}"]`)!.append(task);const next=pt?['Planejar','Construir','Entregar']:['Plan','Build','Ship'];task.querySelector('small')!.textContent=`${pt?'Mover para':'Move to'} ${next[(step+1)%3]}`;status!.textContent=`${name}: ${next[step]}.`;task.focus();})});
 const tiles=Array.from(lab.querySelectorAll<HTMLButtonElement>('[data-shape]'));let selected:HTMLButtonElement[]=[];
 const reset=()=>{selected=[];tiles.forEach(t=>{t.setAttribute('aria-pressed','false');t.disabled=false;t.classList.remove('matched')});status!.textContent=pt?'Selecione três formas iguais em qualquer posição.':'Select three matching shapes in any position.';};
 tiles.forEach(tile=>tile.addEventListener('click',()=>{if(selected.length===3)reset();const index=selected.indexOf(tile);if(index>=0){selected.splice(index,1);tile.setAttribute('aria-pressed','false');return;}selected.push(tile);tile.setAttribute('aria-pressed','true');if(selected.length===3){const match=matchingTrio(selected.map(t=>t.dataset.shape));status!.textContent=match?(pt?'Combinação encontrada! Reinicie para experimentar novamente.':'Match found! Reset to try again.'):(pt?'Formas diferentes. Escolha uma peça para tentar outra combinação.':'Different shapes. Choose a piece to try another combination.');if(match)selected.forEach(t=>{t.classList.add('matched')});}else status!.textContent=`${selected.length} / 3`; }));
 lab.querySelector('.lab-reset')?.addEventListener('click',reset);
 const range=lab.querySelector<HTMLInputElement>('input[type=range]');range?.addEventListener('input',()=>{const value=range.value;lab.querySelector<HTMLElement>('.lab-crop img')!.style.objectPosition=`${value}% center`;lab.querySelector('output')!.textContent=`${value}%`;});
}
