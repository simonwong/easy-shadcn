# Helper

## 组件控制思路

### 组件

#### 受控/非受控

组件受控：
props.open -> innerOpen
props.onOpenChange -> open -> setInnerOpen

非受控:
props.open -> innerOpen
props.onOpenChange -> setInnerOpen

#### 状态逻辑

组件显示隐藏：innerOpen 控制。
组件内部打开关闭触发 onOpenChange

组件动画结束：afterClose

## Helper 思路

create: 注册组件，放回 ModalHOC
useModal: 控制组件的状态+actions

- visible
- show
- hide
- remove

show(ModalHOC): visible = true -> props.open -> innerOpen
hide(ModalHOC): visible = false -> props.open -> innerOpen

被动触发：afterClose -> resolveHide; !keepMounted && remove()

所以整体流程为：
1、受控：show(ModalHOC) -> visible = true -> props.open -> innerOpen
2、受控：hide(ModalHOC) -> visible = false -> props.open -> innerOpen -> afterClose -> resolveHide; !keepMounted && remove()
3、内部：onOpenChange -> show(ModalHOC) / hide(ModalHOC)
