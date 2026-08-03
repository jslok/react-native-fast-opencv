import { useState } from 'react';
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
] as const;

interface EllipseInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

interface ExampleState {
  image: string;
  ellipse: EllipseInfo;
}

function buildEllipseExample(): ExampleState {
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
    Math.max(1, Math.round(fittedEllipse.width / 2)),
    Math.max(1, Math.round(fittedEllipse.height / 2))
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
  OpenCV.circle(
    image,
    center,
    5,
    Scalar.create(30, 30, 220),
    LineTypes.FILLED,
    LineTypes.LINE_AA
  );

  return {
    image: image.toBase64(),
    ellipse: {
      x: fittedEllipse.x,
      y: fittedEllipse.y,
      width: fittedEllipse.width,
      height: fittedEllipse.height,
      angle: fittedEllipse.angle,
    },
  };
}

export function FitEllipseExample() {
  const [example, setExample] = useState<ExampleState>(() =>
    buildEllipseExample()
  );

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
          <Text style={styles.value}>
            x (center): {example.ellipse.x.toFixed(1)}
          </Text>
          <Text style={styles.value}>
            y (center): {example.ellipse.y.toFixed(1)}
          </Text>
          <Text style={styles.value}>
            width (full axis): {example.ellipse.width.toFixed(1)}
          </Text>
          <Text style={styles.value}>
            height (full axis): {example.ellipse.height.toFixed(1)}
          </Text>
          <Text style={styles.value}>
            angle: {example.ellipse.angle.toFixed(1)}
          </Text>
        </View>
      ) : null}

      <Text style={styles.note}>
        The drawn ellipse uses width / 2 and height / 2 because OpenCV.ellipse
        expects half-axis sizes.
      </Text>
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
    color: 'black',
  },
  value: {
    color: 'black',
  },
  note: {
    color: '#444',
    lineHeight: 20,
  },
});
