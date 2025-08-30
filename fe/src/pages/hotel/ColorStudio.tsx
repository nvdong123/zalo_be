import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Slider,
  Button,
  Space,
  Typography,
  message,
  Tooltip,
  Divider,
  Input,
  Select,
  Badge,
  Modal,
  Tag
} from 'antd';
import {
  CopyOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  EyeOutlined,
  SaveOutlined,
  ReloadOutlined,
  FormatPainterOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface ColorInfo {
  hex: string;
  hsl: { h: number; s: number; l: number };
  rgb: { r: number; g: number; b: number };
  name?: string;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: ColorInfo[];
  gradient?: string;
}

const ColorStudio: React.FC = () => {
  // Current color state
  const [currentColor, setCurrentColor] = useState<ColorInfo>({
    hex: '#1890ff',
    hsl: { h: 210, s: 100, l: 56 },
    rgb: { r: 24, g: 144, b: 255 }
  });

  // Palette management
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [currentPalette, setCurrentPalette] = useState<ColorInfo[]>([]);
  const [paletteName, setPaletteName] = useState('');

  // Gradient state
  const [gradientColors, setGradientColors] = useState<ColorInfo[]>([
    currentColor,
    { hex: '#52c41a', hsl: { h: 103, s: 57, l: 44 }, rgb: { r: 82, g: 196, b: 26 } }
  ]);
  const [gradientDirection, setGradientDirection] = useState<number>(90);

  // Modal states
  const [paletteModalVisible, setPaletteModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  // Color conversion utilities
  const hslToRgb = (h: number, s: number, l: number) => {
    s = s / 100;
    l = l / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Update color from HSL
  const updateColorFromHSL = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    
    setCurrentColor({
      hex,
      hsl: { h, s, l },
      rgb
    });
  }, []);

  // Update color from hex input
  const updateColorFromHex = (hexValue: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(hexValue)) return;
    
    const r = parseInt(hexValue.slice(1, 3), 16);
    const g = parseInt(hexValue.slice(3, 5), 16);
    const b = parseInt(hexValue.slice(5, 7), 16);
    const hsl = rgbToHsl(r, g, b);
    
    setCurrentColor({
      hex: hexValue,
      hsl,
      rgb: { r, g, b }
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`${label} copied: ${text}`);
    });
  };

  // Add to palette
  const addToPalette = () => {
    if (currentPalette.length >= 10) {
      message.warning('Palette can have maximum 10 colors');
      return;
    }
    
    if (currentPalette.some(color => color.hex === currentColor.hex)) {
      message.warning('Color already in palette');
      return;
    }

    setCurrentPalette([...currentPalette, currentColor]);
    message.success('Color added to palette');
  };

  // Remove from palette
  const removeFromPalette = (index: number) => {
    const newPalette = currentPalette.filter((_, i) => i !== index);
    setCurrentPalette(newPalette);
  };

  // Save palette
  const savePalette = () => {
    if (!paletteName.trim()) {
      message.error('Please enter palette name');
      return;
    }

    if (currentPalette.length === 0) {
      message.error('Palette is empty');
      return;
    }

    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: paletteName,
      colors: [...currentPalette],
      gradient: generateGradientFromPalette(currentPalette)
    };

    setSavedPalettes([...savedPalettes, newPalette]);
    setPaletteName('');
    setCurrentPalette([]);
    message.success('Palette saved successfully');
  };

  // Generate gradient from palette
  const generateGradientFromPalette = (colors: ColorInfo[]) => {
    if (colors.length < 2) return '';
    const colorStops = colors.map(color => color.hex).join(', ');
    return `linear-gradient(${gradientDirection}deg, ${colorStops})`;
  };

  // Generate current gradient
  const currentGradient = `linear-gradient(${gradientDirection}deg, ${gradientColors.map(c => c.hex).join(', ')})`;

  // Predefined beautiful color schemes
  const presetPalettes = [
    {
      name: 'Ocean Breeze',
      colors: ['#0077be', '#00a8cc', '#40e0d0', '#48cae4', '#90e0ef']
    },
    {
      name: 'Sunset Vibes',
      colors: ['#ff6b35', '#f7931e', '#ffd23f', '#06ffa5', '#118ab2']
    },
    {
      name: 'Forest Path',
      colors: ['#2d5016', '#3d6b20', '#4f7942', '#61a5c2', '#a9def9']
    },
    {
      name: 'Purple Rain',
      colors: ['#6a4c93', '#8b5a9f', '#a663cc', '#c77dff', '#e0aaff']
    },
    {
      name: 'Minimalist',
      colors: ['#000000', '#333333', '#666666', '#999999', '#cccccc']
    }
  ];

  // Generate harmonious colors
  const generateHarmony = (type: 'complementary' | 'triadic' | 'analogous' | 'split-complementary') => {
    const baseHue = currentColor.hsl.h;
    const baseS = currentColor.hsl.s;
    const baseL = currentColor.hsl.l;
    
    let hues: number[] = [];
    
    switch (type) {
      case 'complementary':
        hues = [baseHue, (baseHue + 180) % 360];
        break;
      case 'triadic':
        hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
        break;
      case 'analogous':
        hues = [
          (baseHue - 30 + 360) % 360,
          baseHue,
          (baseHue + 30) % 360,
          (baseHue + 60) % 360
        ];
        break;
      case 'split-complementary':
        hues = [
          baseHue,
          (baseHue + 150) % 360,
          (baseHue + 210) % 360
        ];
        break;
    }

    const harmonyColors = hues.map(h => {
      const rgb = hslToRgb(h, baseS, baseL);
      return {
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        hsl: { h, s: baseS, l: baseL },
        rgb
      };
    });

    setCurrentPalette(harmonyColors);
    message.success(`${type} harmony generated!`);
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Title level={1} style={{ margin: 0 }}>
            <FormatPainterOutlined /> Color Studio
          </Title>
          <Text type="secondary">Professional color picker, palette generator & gradient maker</Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Main Color Picker */}
          <Col xs={24} lg={8}>
            <Card title="Color Picker" size="small">
              {/* Color Display */}
              <div
                style={{
                  width: '100%',
                  height: 120,
                  backgroundColor: currentColor.hex,
                  borderRadius: 8,
                  marginBottom: 16,
                  border: '1px solid #d9d9d9',
                  cursor: 'pointer'
                }}
                onClick={() => copyToClipboard(currentColor.hex, 'Color')}
              />

              {/* HSL Sliders */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>Hue: {currentColor.hsl.h}°</Text>
                <Slider
                  min={0}
                  max={360}
                  value={currentColor.hsl.h}
                  onChange={(h) => updateColorFromHSL(h, currentColor.hsl.s, currentColor.hsl.l)}
                  style={{ 
                    marginBottom: 8,
                    background: `linear-gradient(to right, 
                      hsl(0, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%),
                      hsl(60, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%),
                      hsl(120, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%),
                      hsl(180, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%),
                      hsl(240, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%),
                      hsl(300, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%),
                      hsl(360, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%))`
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong>Saturation: {currentColor.hsl.s}%</Text>
                <Slider
                  min={0}
                  max={100}
                  value={currentColor.hsl.s}
                  onChange={(s) => updateColorFromHSL(currentColor.hsl.h, s, currentColor.hsl.l)}
                  style={{ marginBottom: 8 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong>Lightness: {currentColor.hsl.l}%</Text>
                <Slider
                  min={0}
                  max={100}
                  value={currentColor.hsl.l}
                  onChange={(l) => updateColorFromHSL(currentColor.hsl.h, currentColor.hsl.s, l)}
                  style={{ marginBottom: 8 }}
                />
              </div>

              {/* Color Values */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  addonBefore="HEX"
                  value={currentColor.hex}
                  onChange={(e) => updateColorFromHex(e.target.value)}
                  suffix={
                    <Tooltip title="Copy HEX">
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        size="small"
                        onClick={() => copyToClipboard(currentColor.hex, 'HEX')}
                      />
                    </Tooltip>
                  }
                />
                <Input
                  addonBefore="RGB"
                  value={`${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b}`}
                  readOnly
                  suffix={
                    <Tooltip title="Copy RGB">
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        size="small"
                        onClick={() => copyToClipboard(`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`, 'RGB')}
                      />
                    </Tooltip>
                  }
                />
                <Input
                  addonBefore="HSL"
                  value={`${currentColor.hsl.h}°, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%`}
                  readOnly
                  suffix={
                    <Tooltip title="Copy HSL">
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        size="small"
                        onClick={() => copyToClipboard(`hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`, 'HSL')}
                      />
                    </Tooltip>
                  }
                />
              </Space>

              <Divider />

              {/* Color Harmony Generators */}
              <div>
                <Text strong>Generate Harmony:</Text>
                <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                  <Col span={12}>
                    <Button 
                      size="small" 
                      block 
                      onClick={() => generateHarmony('complementary')}
                    >
                      Complementary
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      size="small" 
                      block 
                      onClick={() => generateHarmony('triadic')}
                    >
                      Triadic
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      size="small" 
                      block 
                      onClick={() => generateHarmony('analogous')}
                    >
                      Analogous
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      size="small" 
                      block 
                      onClick={() => generateHarmony('split-complementary')}
                    >
                      Split-Comp
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          {/* Current Palette */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <Space>
                  Current Palette
                  <Badge count={currentPalette.length} />
                </Space>
              }
              size="small"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="small"
                  onClick={addToPalette}
                >
                  Add Color
                </Button>
              }
            >
              {/* Palette Colors */}
              <div style={{ marginBottom: 16 }}>
                {currentPalette.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    <FormatPainterOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                    <div>No colors in palette</div>
                    <div>Add colors to create your palette</div>
                  </div>
                ) : (
                  <Row gutter={[8, 8]}>
                    {currentPalette.map((color, index) => (
                      <Col span={8} key={index}>
                        <Tooltip title={`${color.hex} - Click to copy`}>
                          <div
                            style={{
                              width: '100%',
                              height: 60,
                              backgroundColor: color.hex,
                              borderRadius: 4,
                              cursor: 'pointer',
                              border: '1px solid #d9d9d9',
                              position: 'relative'
                            }}
                            onClick={() => copyToClipboard(color.hex, 'Color')}
                          >
                            <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              size="small"
                              style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                color: color.hsl.l > 50 ? '#000' : '#fff'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromPalette(index);
                              }}
                            />
                          </div>
                        </Tooltip>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>

              {/* Palette Actions */}
              {currentPalette.length > 0 && (
                <>
                  <Input
                    placeholder="Enter palette name"
                    value={paletteName}
                    onChange={(e) => setPaletteName(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button 
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={savePalette}
                      disabled={!paletteName.trim()}
                    >
                      Save Palette
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={() => setCurrentPalette([])}
                    >
                      Clear
                    </Button>
                  </Space>
                </>
              )}
            </Card>

            {/* Preset Palettes */}
            <Card title="Preset Palettes" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {presetPalettes.map((preset, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <div style={{ marginBottom: 4 }}>
                      <Text strong>{preset.name}</Text>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {preset.colors.map((hex, colorIndex) => (
                        <Tooltip key={colorIndex} title={`${hex} - Click to copy`}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              backgroundColor: hex,
                              borderRadius: 4,
                              cursor: 'pointer',
                              border: '1px solid #d9d9d9',
                              flex: 1
                            }}
                            onClick={() => copyToClipboard(hex, 'Color')}
                          />
                        </Tooltip>
                      ))}
                      <Button
                        type="text"
                        size="small"
                        onClick={() => {
                          const colors = preset.colors.map(hex => {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            const hsl = rgbToHsl(r, g, b);
                            return { hex, hsl, rgb: { r, g, b } };
                          });
                          setCurrentPalette(colors);
                          message.success(`${preset.name} palette loaded`);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Gradient Generator */}
          <Col xs={24} lg={8}>
            <Card title="Gradient Generator" size="small">
              {/* Gradient Preview */}
              <div
                style={{
                  width: '100%',
                  height: 120,
                  background: currentGradient,
                  borderRadius: 8,
                  marginBottom: 16,
                  border: '1px solid #d9d9d9',
                  cursor: 'pointer'
                }}
                onClick={() => copyToClipboard(currentGradient, 'Gradient CSS')}
              />

              {/* Gradient Direction */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>Direction: {gradientDirection}°</Text>
                <Slider
                  min={0}
                  max={360}
                  value={gradientDirection}
                  onChange={setGradientDirection}
                  style={{ marginBottom: 8 }}
                />
              </div>

              {/* Gradient Colors */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>Gradient Colors:</Text>
                <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                  {gradientColors.map((color, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          backgroundColor: color.hex,
                          borderRadius: 4,
                          border: '1px solid #d9d9d9'
                        }}
                      />
                      <Input
                        value={color.hex}
                        onChange={(e) => {
                          const newColors = [...gradientColors];
                          const hex = e.target.value;
                          if (/^#[0-9A-F]{6}$/i.test(hex)) {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            const hsl = rgbToHsl(r, g, b);
                            newColors[index] = { hex, hsl, rgb: { r, g, b } };
                            setGradientColors(newColors);
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                      {gradientColors.length > 2 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => {
                            const newColors = gradientColors.filter((_, i) => i !== index);
                            setGradientColors(newColors);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </Space>
              </div>

              {/* Gradient Actions */}
              <Space style={{ width: '100%' }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    if (gradientColors.length < 5) {
                      setGradientColors([...gradientColors, currentColor]);
                    }
                  }}
                  disabled={gradientColors.length >= 5}
                >
                  Add Color
                </Button>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(currentGradient, 'Gradient CSS')}
                >
                  Copy CSS
                </Button>
              </Space>

              {/* CSS Output */}
              <div style={{ marginTop: 16 }}>
                <Text strong>CSS:</Text>
                <Input.TextArea
                  value={`background: ${currentGradient};`}
                  readOnly
                  rows={2}
                  style={{ marginTop: 4, fontSize: 12 }}
                />
              </div>
            </Card>

            {/* Saved Palettes */}
            {savedPalettes.length > 0 && (
              <Card title="Saved Palettes" size="small" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {savedPalettes.map((palette) => (
                    <div key={palette.id} style={{ border: '1px solid #f0f0f0', padding: 8, borderRadius: 4 }}>
                      <div style={{ marginBottom: 4 }}>
                        <Text strong>{palette.name}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ({palette.colors.length} colors)
                        </Text>
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                        {palette.colors.map((color, index) => (
                          <div
                            key={index}
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: color.hex,
                              borderRadius: 2,
                              border: '1px solid #d9d9d9',
                              flex: 1,
                              cursor: 'pointer'
                            }}
                            onClick={() => copyToClipboard(color.hex, 'Color')}
                          />
                        ))}
                      </div>
                      <Space>
                        <Button
                          size="small"
                          onClick={() => {
                            setCurrentPalette(palette.colors);
                            message.success(`${palette.name} loaded`);
                          }}
                        >
                          Load
                        </Button>
                        <Button
                          size="small"
                          danger
                          onClick={() => {
                            const newPalettes = savedPalettes.filter(p => p.id !== palette.id);
                            setSavedPalettes(newPalettes);
                            message.success(`${palette.name} deleted`);
                          }}
                        >
                          Delete
                        </Button>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ColorStudio;
