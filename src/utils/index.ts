// draggable.ts (自定义指令实现)
import type { Directive } from 'vue';
const Draggable: Directive = {
  mounted(el, binding) {
    // console.log('mounted', el, binding);
    const observer = new MutationObserver(() => {
      bindDragEvents();
    });
    observer.observe(el, { childList: true, subtree: true });
    function bindDragEvents() {
      el.querySelectorAll('.el-table__row').forEach((rowEl: HTMLElement, index: number) => {
        rowEl.draggable = true;
        rowEl.dataset.index = index.toString();
        rowEl.ondragstart = (e: DragEvent) => {
          e.stopPropagation();
          const index = Number(rowEl.dataset.index);
          const list = binding.value.data;
          
          if (list[index]) {
            list[index].dragging = true; // 1. 修改数据状态
          }

          if (e.dataTransfer) {
            e.dataTransfer.setData('index', index.toString());
            e.dataTransfer.effectAllowed = 'move';
          }
        };

        rowEl.ondragend = (e: DragEvent) => {
          e.stopPropagation();
          const index = Number(rowEl.dataset.index);
          const list = binding.value.data;
          
          if (list[index]) {
            list[index].dragging = false; // 2. 恢复数据状态
          }
        };
      });
    }

    el.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const fromIndex = Number(e.dataTransfer?.getData('index'));
      const toIndex = Array.from(el.querySelectorAll('.el-table__row')).indexOf(
        (e.target as HTMLElement).closest('.el-table__row') as HTMLElement
      );
      const list = binding.value.data;
      if (fromIndex !== toIndex && toIndex !== -1) {
        const draggedItem = list.splice(fromIndex, 1)[0];
        list.splice(toIndex, 0, draggedItem);
      }
      // 重新绑定索引
      bindDragEvents();
    });

    el.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    });

    bindDragEvents();
  }
};

export default Draggable;