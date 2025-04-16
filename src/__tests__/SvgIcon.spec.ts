import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import SvgIcon from '../components/SvgIcon.vue'

describe('SvgIcon 组件', () => {
  it('使用默认属性正确渲染', () => {
    const { container } = render(SvgIcon, {
      props: { name: 'test-icon' }
    })
    
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('width')).toBe('24')
    expect(svg?.getAttribute('height')).toBe('24')
  })
  
  it('使用自定义尺寸渲染', () => {
    const { container } = render(SvgIcon, {
      props: { name: 'test-icon', size: 32 }
    })
    
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32px')
    expect(svg?.getAttribute('height')).toBe('32px')
  })
  
  it('使用自定义颜色渲染', () => {
    const { container } = render(SvgIcon, {
      props: { name: 'test-icon', color: '#ff0000' }
    })
    
    const svg = container.querySelector('svg')
    expect(svg?.style.color).toBe('#ff0000')
  })
}) 