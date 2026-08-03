# Fit an ellipse to a contour

This example shows the smallest useful `fitEllipse` flow in this repo: build a contour, fit the ellipse, draw the result, and inspect the returned `RotatedRect`.

### Why this example uses synthetic points

The goal here is to demonstrate the `fitEllipse` API itself, not contour extraction. A synthetic contour keeps the result deterministic and makes the returned geometry easy to verify.

In real image-processing pipelines you would usually pass a contour returned by `findContours`.

### Returned shape

`OpenCV.fitEllipse(...)` returns a `RotatedRect` in this library:

- `x`, `y` are the ellipse center coordinates
- `width`, `height` are the full axis lengths
- `angle` is the rotation angle in degrees

When drawing that ellipse back with `OpenCV.ellipse(...)`, remember that the drawing API expects half-axis sizes, so the example divides `width` and `height` by `2`.

### Code

```js
import { useState } from 'react';
import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  LineTypes,
  Mat,
  OpenCV,
  Point,
  PointVector,
  Scalar,
  Size,
} from 'react-native-fast-opencv';

const CANVAS_SIZE = 320;

const samplePoints = [
  [63, 177],
  [76, 211],
  [103, 239],
  [143, 254],
  [188, 251],
  [227, 229],
  [254, 193],
  [264, 150],
  [256, 108],
  [228, 74],
  [189, 53],
  [144, 49],
  [103, 65],
  [75, 95],
  [61, 136],
];

function buildEllipseExample() {
  const background = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE * 3).fill(255);
  const image = Mat.createFromBuffer(
    'uint8',
    CANVAS_SIZE,
    CANVAS_SIZE,
    3,
    background
  );
  const contour = PointVector.create();

  for (const [x, y] of samplePoints) {
    const point = Point.create(x, y);
    contour.push(point);

    OpenCV.circle(
      image,
      point,
      4,
      Scalar.create(70, 70, 70),
      LineTypes.FILLED,
      LineTypes.LINE_AA
    );
  }

  const fittedEllipse = OpenCV.fitEllipse(contour);
  const center = Point.create(
    Math.round(fittedEllipse.x),
    Math.round(fittedEllipse.y)
  );
  const axes = Size.create(
    Math.round(fittedEllipse.width / 2),
    Math.round(fittedEllipse.height / 2)
  );

  OpenCV.ellipse(
    image,
    center,
    axes,
    fittedEllipse.angle,
    0,
    360,
    Scalar.create(40, 110, 255),
    4,
    LineTypes.LINE_AA
  );

  return {
    image: image.toBase64(),
    ellipse: fittedEllipse,
  };
}

export function FitEllipseExample() {
  const [example, setExample] = useState(() => buildEllipseExample());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button
        title="Generate ellipse"
        onPress={() => setExample(buildEllipseExample())}
      />

      {example.image ? (
        <Image
          source={{ uri: 'data:image/png;base64,' + example.image }}
          style={styles.image}
        />
      ) : null}

      {example.ellipse ? (
        <View style={styles.values}>
          <Text style={styles.heading}>RotatedRect result</Text>
          <Text>x (center): {example.ellipse.x.toFixed(1)}</Text>
          <Text>y (center): {example.ellipse.y.toFixed(1)}</Text>
          <Text>width (full axis): {example.ellipse.width.toFixed(1)}</Text>
          <Text>height (full axis): {example.ellipse.height.toFixed(1)}</Text>
          <Text>angle: {example.ellipse.angle.toFixed(1)}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: 'white',
  },
  image: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignSelf: 'center',
  },
  values: {
    gap: 4,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### Using a real contour

If you already have contours from `OpenCV.findContours(...)`, the core part becomes:

```js
const contour = contours.get(index);
const ellipse = OpenCV.fitEllipse(contour);
```

Make sure the contour has at least 5 points before calling `fitEllipse`.
