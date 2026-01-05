import type { Directive } from 'vue';

interface BindingValue {
  columns: any[];
  index: number;
}

const DragCol: Directive = {
  mounted(el, binding) {
    const { columns, index } = binding.value as BindingValue;

    // 使列头可拖拽
    el.setAttribute('draggable', 'true');

    el.ondragstart = (e: DragEvent) => {
      e.dataTransfer?.setData('dragColIndex', index.toString());
      el.style.opacity = '0.5';
    };

    el.ondragend = (e: DragEvent) => {
      el.style.opacity = '1';
    };

    el.ondragover = (e: DragEvent) => {
      e.preventDefault(); // 必须阻止默认事件，允许drop
      el.style.borderRight = '2px solid #409eff';
    };

    el.ondragleave = (e: DragEvent) => {
      el.style.borderRight = '';
    };

    el.ondrop = (e: DragEvent) => {
      e.preventDefault();
      el.style.borderRight = '';

      const fromIndexStr = e.dataTransfer?.getData('dragColIndex');
      if (fromIndexStr === null) return;

      const fromIndex = Number(fromIndexStr);
      const toIndex = index;

      if (fromIndex === toIndex) return;

      // 交换列配置数组顺序
      const movedCol = columns.splice(fromIndex, 1)[0];
      columns.splice(toIndex, 0, movedCol);
    };
  }
};

export default DragCol;
