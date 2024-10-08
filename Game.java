
import java.util.ArrayList;
import java.util.Scanner;

public class Game {

    public static void main(String[] args) {

        Scanner input = new Scanner(System.in);
        ArrayList<Theory> theories = new ArrayList<>();

        boolean xFound = false;
        boolean hasCon = false;
        boolean correct = false;
        int start;
        int end;
        int lastStart = 1;
        int theoAmount = 0;
        int finderOfX = -1;
        int theoryObject;
        int xLoc = 8;
        int xPrediction;
        int preXLoc;
        int preObj;
        int postXLoc;
        int postObj;
        String theoryLocation;
        String[] research = {"The dwarf planet is not within 2 sectors of a comet.", "All the gas clouds are in a band of 4 sectors or less.", "At least one asteroid is adjacent to a comet.", "The dwarf planet is adjacent to an asteroid.", "At least one gas cloud is adjacent to the dwarf planet.", "At least one gas cloud is directly opposite an asteroid."};
        int[][] locVal = new int[4][3];
        for (int i = 0; i < 4; i++) {
            locVal[i][1] = i + 1;
            locVal[i][0] = 1;
        }
        int[] sector = {1, 2, 3, 4, 4, 3, 0, 4, 1, 1, 0, 1};
        //int[] sector = new int[12];
        /*for (int i = 0; i < 12; i++) {
            sector[i] = 4;
        } */

        while (!xFound) {

            System.out.println("Enter move (Player " + locVal[0][1] + ")");
            switch (input.nextLine().toLowerCase()) {
                case "survey":
                    System.out.println("For what?");
                    int obj = input.nextInt();
                    System.out.println("Start Where?");
                    int sStart = input.nextInt();
                    System.out.println("End Where");
                    int sEnd = input.nextInt();
                    input.nextLine();
                    int range = 0;
                    int tsStart = sStart;
                    while (tsStart != (sEnd + 1) % 12) {
                        tsStart = (tsStart + 1) % 12;
                        range++;
                    }
                    if (range < 4) {
                        locVal[0][0] += 4;
                    } else {
                        locVal[0][0] += 3;
                    }
                    int amount = Function.search(sStart, range, obj, sector);
                    System.out.println("Your survey has found " + amount);
                    break;
                case "research":
                    System.out.println("Choose Research");
                    System.out.println(research[input.nextInt()]);
                    input.nextLine();
                    locVal[0][0] += 1;
                    break;
                case "target":
                    System.out.println("Which Sector?");
                    int targSec = input.nextInt();
                    input.nextLine();
                    System.out.println("There is a " + sector[targSec - 1] + " in " + targSec);
                    locVal[0][0] += 4;
                    break;
                case "x":
                    System.out.println("Enter Location of Planet X");
                    xPrediction = input.nextInt();
                    preXLoc = xPrediction - 1;
                    if (preXLoc == 0) {
                        preXLoc += 12;
                    }
                    System.out.println("Enter object in sector " + preXLoc);
                    preObj = input.nextInt();
                    postXLoc = (xPrediction + 1) % 12;
                    if (postXLoc == 0) {
                        postXLoc += 12;
                    }
                    System.out.println("Enter object in sector " + postXLoc);
                    postObj = input.nextInt();
                    input.nextLine();
                    if (preObj == sector[preXLoc - 1] && postObj == sector[postXLoc - 1]
                            && xPrediction == xLoc) {
                        System.out.println("You have found Planet X");
                        finderOfX = locVal[0][1];
                        locVal[0][2] += 10;
                        xFound = true;
                    } else {
                        System.out.println("You have failed to find Planet X");
                    }
                    locVal[0][0] += 5;
            }

            Function.sort(locVal);
            for (int i = 0; i < 4; i++) {

                int secNum = locVal[i][0] % 12;
                if (secNum == 0) {
                    secNum += 12;
                }
                System.out.print("Player " + locVal[i][1] + " : " + " in " + secNum + " with " + locVal[i][2] + " | ");
            }
            start = locVal[0][0] % 12;
            if (start == 0) {
                start = 12;
            }
            end = (start + 5) % 12;
            if (end == 0) {
                end = 12;
            }
            System.out.println("Visible Sectors: " + start + " - " + end);

            for (int i = 1; i <= 10; i += 3) {
                for (int j = i; j <= locVal[0][0]; j += 12) {
                    if (j > lastStart) {
                        theoAmount++;
                    }
                }
            }
            for (int i = 0; i < theoAmount; i++) {
                for (int j = 0; j < 4; j++) {
                    System.out.println("Player " + locVal[j][1] + ", Enter Theory Location");
                    theoryLocation = input.nextLine();
                    if ((!theoryLocation.isEmpty())) {
                        System.out.println("Enter Object in Location");
                        theoryObject = input.nextInt();
                        input.nextLine();
                        theories.add(new Theory(theoryObject, locVal[j][1], Integer.parseInt(theoryLocation)));
                    }
                }
                for (Theory theory : theories) {
                    theory.position -= 1;
                }
                for (int j = 1; j < 13; j++) {
                    for (Theory theory : theories) {
                        if ((theory.position == 0 || correct) && theory.sector == j) {
                            if (theory.type == sector[j - 1]) {
                                System.out.println("Player " + theory.player + " is Correct, " + theory.type
                                        + " is in " + theory.sector);
                                locVal[Function.findIndex(locVal, theory.player)][2] += 3;
                                correct = true;
                                if (theory.position == 0) {
                                    locVal[Function.findIndex(locVal, theory.player)][2]++;
                                }
                            } else {
                                System.out.println("Player " + theory.player + " is Incorrect, " + theory.type
                                        + "is not in " + theory.sector);
                                locVal[Function.findIndex(locVal, theory.player)][0] += 1;
                            }
                        }
                    }
                }
                Function.sort(locVal);
                for (int j = 0; j < 4; j++) {
                    int secNum = locVal[j][0] % 12;
                    if (secNum == 0) {
                        secNum += 12;
                    }
                    System.out.print(
                            "Player " + locVal[j][1] + " : " + " in " + secNum + " with " + locVal[j][2] + " | ");
                }
                start = locVal[0][0] % 12;
                if (start == 0) {
                    start = 12;
                }
                end = (start + 5) % 12;
                if (end == 0) {
                    end = 12;
                }
                System.out.println("Visible Sectors: " + start + " - " + end);
            }

            lastStart = locVal[0][0];
            theoAmount = 0;

            if (locVal[0][0] > 12 && !hasCon) {
                System.out.println("Planet X is not within 3 sectors of the dwarf planet.");
                hasCon = true;
            }
        }

        for (int i = Function.findIndex(locVal, finderOfX); i < 3; i++) {
            int a, b, c;
            a = locVal[i + 1][0];
            b = locVal[i + 1][1];
            c = locVal[i + 1][2];
            locVal[i + 1][0] = locVal[i][0];
            locVal[i + 1][0] = locVal[i][1];
            locVal[i + 1][0] = locVal[i][2];
            locVal[i][0] = a;
            locVal[i][1] = b;
            locVal[i][2] = c;
        }
        for (int i = 0; i < 3; i++) {
            System.out.println("Final Selection, Theory or X, Player " + locVal[i][1]);
            if (input.nextLine().toLowerCase().equals("theory")) {
                for (int j = 0; j < 2; j++) {
                    System.out.println("Enter Theory Location");
                    theoryLocation = input.nextLine();
                    System.out.println("Enter Theory Object");
                    theoryObject = input.nextInt();
                    if (sector[Integer.parseInt(theoryLocation) - 1] == theoryObject) {
                        System.out.println("Your Theory is Correct");
                        locVal[i][2] += 3;
                    } else {
                        System.out.println("Your Theory is Incorrect");
                    }
                    input.nextLine();
                }
            } else {
                System.out.println("Enter Location of Planet X");
                xLoc = input.nextInt();
                preXLoc = xLoc - 1;
                if (preXLoc == 0) {
                    preXLoc += 12;
                }
                System.out.println("Enter object in sector " + preXLoc);
                preObj = input.nextInt();
                postXLoc = (xLoc + 1) % 12;
                if (postXLoc == 0) {
                    postXLoc += 12;
                }
                System.out.println("Enter object in sector " + postXLoc);
                postObj = input.nextInt();
                input.nextLine();
                if (preObj == sector[preXLoc - 1] && postObj == sector[postXLoc - 1]
                        && xLoc - 1 == Function.findIndex(sector, 5)) {
                    System.out.println("You have found Planet X");
                    locVal[0][2] += (locVal[3][0] - locVal[i][0]) * 2;
                } else {
                    System.out.println("You have failed to find Planet X");
                }
            }
        }
        for (int i = 0; i < 4; i++) {
            locVal[i][0] = locVal[i][1];
        }
        Function.sort(locVal);
        for (int i = 0; i < 4; i++) {
            System.out.println("Player " + locVal[i][1] + " Has " + locVal[i][2] + " Points");
        }
        System.out.println("The Winner is Player " + locVal[0][1]);
    }
}

class Function {

    public static int[][] sort(int[][] locVal) {

        int a, b, c;
        boolean d = true;

        while (d) {

            d = false;

            for (int i = 0; i < 3; i++) {

                if (locVal[i][0] > locVal[i + 1][0]) {

                    a = locVal[i][0];
                    b = locVal[i][1];
                    c = locVal[i][2];
                    locVal[i][0] = locVal[i + 1][0];
                    locVal[i][1] = locVal[i + 1][1];
                    locVal[i][2] = locVal[i + 1][2];
                    locVal[i + 1][0] = a;
                    locVal[i + 1][1] = b;
                    locVal[i + 1][2] = c;
                    d = true;
                }
            }
        }
        return locVal;
    }

    public static int search(int start, int range, int obj, int[] sector) {
        int amount = 0;
        start--;
        for (int i = 0; i < range; i++) {
            if (obj == sector[start + i]) {
                amount++;
            }
        }
        return amount;
    }

    public static int findIndex(int[][] array, int element) {
        for (int i = 0; i < array.length; i++) {
            if (array[i][1] == element) {
                return i;
            }
        }
        return -1;
    }

    public static int findIndex(int[] array, int element) {
        for (int i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return i;
            }
        }
        return -1;
    }
}

class Theory {

    public Theory(int type, int player, int sector) {
        position = 3;
        this.type = type;
        this.player = player;
        this.sector = sector;
    }

    public int position;
    public int type;
    public int player;
    public int sector;
}
