import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import HelloWorld from '../components/HelloWorld.vue'

describe('HelloWorld 组件', () => {
  it('正确渲染 props.msg', () => {
    const msg = '测试标题'
    const { getByText } = render(HelloWorld, {
      props: { msg }
    })
    
    expect(getByText(msg)).toBeTruthy()
  })
  
  it('点击按钮增加计数', async () => {
    const { getByText } = render(HelloWorld, {
      props: { msg: '测试' }
    })
    
    const button = getByText('count is 0')
    await fireEvent.click(button)
    
    expect(getByText('count is 1')).toBeTruthy()
  })
}) 